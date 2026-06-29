<?php

namespace MelisCore\Service;

/**
 * Service du thème du back-office REACT (séparé du legacy MelisCorePlatformSchemeService).
 * Stockage clé/valeur dans `melis_core_platform_scheme_react`. Extensible : header logo,
 * header text, login logo, favicon... La rétrocompatibilité du legacy est préservée (rien
 * de partagé avec l'ancien outil).
 */
class MelisCorePlatformSchemeReactService extends MelisGeneralService
{
    /** @return \MelisCore\Model\Tables\MelisCorePlatformSchemeReactTable */
    private function table()
    {
        return $this->getServiceManager()->get('MelisCorePlatformSchemeReactTable');
    }

    /** Toute la config sous forme de map clé => valeur. @return array<string,string|null> */
    public function getAll(): array
    {
        $out = [];
        foreach ($this->table()->fetchAll() as $row) {
            $out[$row->psreact_key] = $row->psreact_value;
        }
        return $out;
    }

    public function get(string $key, ?string $default = null): ?string
    {
        $row = $this->table()->getEntryByField('psreact_key', $key)->current();
        return $row ? $row->psreact_value : $default;
    }

    /** Upsert d'une clé (insert si absente, update sinon). */
    public function set(string $key, ?string $value): void
    {
        $row = $this->table()->getEntryByField('psreact_key', $key)->current();
        $id = $row ? (int) $row->psreact_id : null;
        $this->table()->save(['psreact_key' => $key, 'psreact_value' => $value], $id);
    }

    /** Upsert de plusieurs clés. @param array<string,mixed> $kv */
    public function setMany(array $kv): void
    {
        foreach ($kv as $k => $v) {
            $this->set((string) $k, $v === null ? null : (string) $v);
        }
    }

    // ─── Traductions (textes du login par langue du BO) ───────────────────────

    /** @return \MelisCore\Model\Tables\MelisCorePlatformSchemeReactTransTable */
    private function transTable()
    {
        return $this->getServiceManager()->get('MelisCorePlatformSchemeReactTransTable');
    }

    /**
     * Toutes les traductions : clé => [ langId => valeur ].
     * @return array<string,array<int,string|null>>
     */
    public function getTranslations(): array
    {
        $out = [];
        foreach ($this->transTable()->fetchAll() as $row) {
            $out[$row->psrtrans_key][(int) $row->psrtrans_lang_id] = $row->psrtrans_value;
        }
        return $out;
    }

    /** Upsert d'une traduction (clé + langue). */
    public function setTranslation(string $key, int $langId, ?string $value): void
    {
        $existing = $this->transTable()->getEntryByField('psrtrans_key', $key);
        $id = null;
        foreach ($existing as $row) {
            if ((int) $row->psrtrans_lang_id === $langId) { $id = (int) $row->psrtrans_id; break; }
        }
        $this->transTable()->save([
            'psrtrans_key'     => $key,
            'psrtrans_lang_id' => $langId,
            'psrtrans_value'   => $value,
        ], $id);
    }
}
