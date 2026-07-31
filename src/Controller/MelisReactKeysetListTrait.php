<?php

namespace MelisCore\Controller;

/**
 * Helper générique de liste « keyset » (scroll infini côté React) pour les contrôleurs
 * react-api en SQL brut. Fournit :
 *   - un tri server-side whitelisté (clé → expression SQL rendue NON-NULL) ;
 *   - une pagination keyset (curseur opaque = valeur de tri + id du dernier élément,
 *     tiebreaker sur l'id unique) → pas d'OFFSET, immunisé aux insertions/suppressions ;
 *   - le total du jeu filtré + le nextCursor (null = fin de liste).
 *
 * Contrat de réponse attendu côté front (cf. hook useKeysetList) :
 *   { items, total, nextCursor }
 *
 * Chaque expression de $sortMap DOIT être non-null (COALESCE) pour que la comparaison
 * du keyset reste fiable sur les colonnes nullables.
 */
trait MelisReactKeysetListTrait
{
    /**
     * @param array $o {
     *   db:           Laminas DB adapter,
     *   from:         "table alias" (ex. "melis_core_user u"),
     *   joins:        string éventuel de JOINs (défaut ''),
     *   selectCols:   liste SELECT (sans le AS __sortval, ajouté ici),
     *   filterWhere:  string[] de conditions (sans WHERE),
     *   filterParams: params liés aux conditions,
     *   sortMap:      ['cle' => 'expr SQL non-null'],
     *   idCol:        colonne id unique qualifiée (ex. 'u.usr_id'),
     *   idAlias:      alias de l'id dans les lignes retournées (ex. 'usr_id'),
     *   sortKey:      clé de tri demandée,
     *   dir:          'asc'|'desc',
     *   after:        curseur opaque (base64) ou '',
     *   limit:        int
     * }
     * @return array{0: array<int,array>, 1: int, 2: ?string} [rows, total, nextCursor]
     *         Chaque row contient la colonne technique __sortval (à ignorer au format).
     */
    protected function keysetList(array $o): array
    {
        $db      = $o['db'];
        $from    = $o['from'];
        $joins   = $o['joins'] ?? '';
        $sortMap = $o['sortMap'];
        $idCol   = $o['idCol'];
        $idAlias = $o['idAlias'];
        $limit   = max(1, (int) $o['limit']);

        $sortKey  = isset($sortMap[$o['sortKey']]) ? $o['sortKey'] : (string) array_key_first($sortMap);
        $sortExpr = $sortMap[$sortKey];
        $dir      = strtolower((string) ($o['dir'] ?? 'desc')) === 'asc' ? 'ASC' : 'DESC';
        $op       = $dir === 'ASC' ? '>' : '<';

        $filterWhere  = $o['filterWhere']  ?? [];
        $filterParams = $o['filterParams'] ?? [];

        // total = taille du jeu filtré (indépendant du curseur).
        $countWhere = $filterWhere ? 'WHERE ' . implode(' AND ', $filterWhere) : '';
        $countRow   = iterator_to_array($db->query("SELECT COUNT(*) AS total FROM $from $joins $countWhere", $filterParams));
        $total      = (int) ($countRow[0]['total'] ?? 0);

        // Keyset : reprendre STRICTEMENT après (valeur de tri, id) du dernier élément.
        $dataWhere  = $filterWhere;
        $dataParams = $filterParams;
        $after      = (string) ($o['after'] ?? '');
        if ($after !== '') {
            $cur = json_decode((string) base64_decode($after, true), true);
            if (is_array($cur) && array_key_exists('v', $cur) && array_key_exists('id', $cur)) {
                $dataWhere[]  = "($sortExpr $op ? OR ($sortExpr = ? AND $idCol $op ?))";
                $dataParams[] = $cur['v'];
                $dataParams[] = $cur['v'];
                $dataParams[] = (int) $cur['id'];
            }
        }
        $dataWhereClause = $dataWhere ? 'WHERE ' . implode(' AND ', $dataWhere) : '';

        $sql = "SELECT {$o['selectCols']}, $sortExpr AS __sortval
                FROM $from $joins
                $dataWhereClause
                ORDER BY $sortExpr $dir, $idCol $dir
                LIMIT ?";
        $rows = iterator_to_array($db->query($sql, array_merge($dataParams, [$limit])));

        $nextCursor = null;
        $n = count($rows);
        if ($n === $limit) {
            $last = (array) $rows[$n - 1];
            $nextCursor = base64_encode((string) json_encode([
                'v'  => $last['__sortval'] ?? null,
                'id' => (int) ($last[$idAlias] ?? 0),
            ]));
        }

        return [$rows, $total, $nextCursor];
    }
}
