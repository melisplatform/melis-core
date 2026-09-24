<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Deletes audit log rows older than the retention period (DEKRA correction plan, item 21.0).
 *
 * Two reasons for this to exist:
 *  - the trail now records client IPs, which are personal data: keeping them forever is not an
 *    option under the GDPR, a retention period has to be decided and applied
 *  - a login event per login makes melis_core_log grow much faster than before
 *
 * Nothing runs it automatically. An administrator schedules it (cron, Kubernetes CronJob,
 * MelisCron task) once the retention period has been agreed:
 *
 *     php public/index.php melis:security:purge-logs --days=365
 *
 * Without --days it uses log_retention_days from config/app.security.php, and does nothing at
 * all when that is 0 - which is the default, so installing this changes no data by itself.
 */
final class PurgeSecurityLogsCommand extends Command
{
    protected static $defaultName = 'melis:security:purge-logs';

    /** @var \Laminas\ServiceManager\ServiceManager */
    private $serviceManager;

    public function setServiceManager($serviceManager)
    {
        $this->serviceManager = $serviceManager;
    }

    public function configure(): void
    {
        $this->setName(self::$defaultName)
            ->setDescription('Deletes audit log entries older than the retention period.')
            ->addOption('days', null, InputOption::VALUE_REQUIRED, 'Retention in days (overrides the configuration)')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Only count what would be deleted');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $config = $this->serviceManager->get('MelisCoreSecurityAudit')->getSecurityConfig();
        $days   = (int) ($input->getOption('days') ?: (isset($config['log_retention_days']) ? $config['log_retention_days'] : 0));

        if ($days <= 0) {
            $output->writeln('No retention period set (log_retention_days = 0): nothing to do.');

            return 0;
        }

        $before  = date('Y-m-d H:i:s', strtotime('-' . $days . ' days'));
        $logTable = $this->serviceManager->get('MelisCoreTableLog');
        $count    = $logTable->countBefore($before);

        if ($input->getOption('dry-run')) {
            $output->writeln($count . ' log entries older than ' . $before . ' would be deleted.');

            return 0;
        }

        $deleted = $logTable->deleteBefore($before);
        $output->writeln($deleted . ' log entries older than ' . $before . ' deleted.');

        return 0;
    }
}
