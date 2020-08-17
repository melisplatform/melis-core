<?php

namespace MelisCore\View\Helper;

use Laminas\View\Helper\AbstractHelper;

class MelisTextHelper extends AbstractHelper
{
    const TEXT_LIMIT = 100;

    public function limitedText($text, $limit = self::TEXT_LIMIT)
    {
        $postString = '...';
        $strCount = strlen($text);
        $sLimitedText = $text;

        if($strCount > $limit)
        {
            $sLimitedText = mb_substr($text, 0, $limit) . $postString;
        }

        return $sLimitedText;

    }

    public function timelineDate($datetime, $full = false) {
        $now = new \DateTime;
        $ago = new \DateTime($datetime);
        $diff = $now->diff($ago);

        $diff->w = floor($diff->d / 7);
        $diff->d -= $diff->w * 7;

        $string = array(
            'y' => 'year',
            'm' => 'month',
            'w' => 'week',
            'd' => 'day',
            'h' => 'hour',
            'i' => 'minute',
            's' => 'second',
        );
        foreach ($string as $k => &$v) {
            if ($diff->$k) {
                $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? 's' : '');
            } else {
                unset($string[$k]);
            }
        }

        if (!$full) $string = array_slice($string, 0, 1);

        return $string ? implode(', ', $string) . ' ago' : 'just now';
    }
}