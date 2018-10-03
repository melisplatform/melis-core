<?php

namespace MelisCore\Service;

use Zend\Authentication\AuthenticationService;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

class MelisCoreAuthService
    extends AuthenticationService
    implements MelisCoreAuthServiceInterface, ServiceLocatorAwareInterface
{
    /**
     * @var \Zend\ServiceManager\ServiceLocatorInterface $serviceLocator
     */
    public $serviceLocator;

    /**
     * @return string
     */
    public function getAuthRights()
    {
        /**
         * @var \Zend\EventManager\EventManagerInterface $e
         */
        $e = $this->getServiceLocator()->get('Application')->getEventManager();
        $e->trigger('melis_core_check_user_rights', $this);

        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $user = $melisCoreAuth->getIdentity();

        $rightsXML = '';

        if (!empty($user)) {
            if (! $this->isRightsUpdated($user->usr_rights)) {
                $user->usr_rights = $this->toNewXmlStructure($this->convertToNewRightsStructure());
            }

            $rightsXML = $user->usr_rights;
        }

        return $rightsXML;
    }

    /**
     * @return \Zend\ServiceManager\ServiceLocatorInterface
     */
    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }

    /**
     * @param \Zend\ServiceManager\ServiceLocatorInterface $sl
     *
     * @return $this
     */
    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;

        return $this;
    }

    /**
     * @param $password
     *
     * @return bool|string
     */
    public function encryptPassword($password)
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     *
     * @param $providedPassword
     * @param $storedHashPassword
     *
     * @return bool
     */
    public function isPasswordCorrect($providedPassword, $storedHashPassword)
    {
        return password_verify($providedPassword, $storedHashPassword);
    }

    /**
     * @return array
     */
    protected function convertToNewRightsStructure()
    {
        /** @var \MelisCore\Service\MelisCoreRightsService $rights */
        $rights = $this->getServiceLocator()->get('MelisCoreRights');

        /** @var \MelisCore\Service\MelisCoreConfigService $config */
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $melisKeys = $config->getMelisKeys();

        /** @var \MelisCore\Service\MelisCore $melisCoreAuth */
        $user = $this->getIdentity();

        $oldRights = $user->usr_rights;

        $oldRights = simplexml_load_string(trim($oldRights));
        $oldRights = json_decode(json_encode($oldRights),1);

        $oldToolParentNode = 'meliscore_tools';
        $oldToolParentNodeRoot = 'meliscore_tools_root';
        $newToolParentNode = $rights::MELIS_PLATFORM_TOOLS_PREFIX;
        $newToolParentNodeRoot = $newToolParentNode . '_root';

        $leftMenuToolNodes = $rights->getMelisKeyPaths();

        $leftMenuToolNodesRoot = array_map( function ($a) {
            return $a . '_root';
        }, $leftMenuToolNodes);

        $newRights = [];
        $sectionItems = [];

        foreach ($oldRights as $node => $itemId) {
            $toolNode = $node;
            $nodeItem = $itemId;

            // move the following tools to their respective sections
            if ($node === $oldToolParentNode || $node === $newToolParentNode) {
                $toolNode = $newToolParentNode;
                $items = isset($itemId['id']) ? $itemId['id'] : null;

                if (is_array($items)) {

                    foreach ($items as $item) {

                        // include the old tool node root if existing
                        if ($oldToolParentNodeRoot === $item) {
                            $item = $item === $oldToolParentNodeRoot ? $newToolParentNodeRoot : $item;
                            $newRights[$toolNode] = ['id' => $item];
                        }

                        $parent = $rights->getToolParent($melisKeys, $item) ?? null;

                        if ($parent) {
                            if (! isset($sectionItems[$parent]['id'])) {
                                $sectionItems[$parent] = ['id' => [$item]];
                            } else {
                                array_push($sectionItems[$parent]['id'],  $item);
                            }
                        }
                    }
                } else {
                    $parent = $rights->getToolParent($melisKeys, $items) ?? null;
                    if ($parent) {
                        if (! isset($sectionItems[$parent]['id'])) {
                            $sectionItems[$parent] = ['id' => [$item]];
                        } else {
                            array_push($sectionItems[$parent]['id'],  $item);
                        }
                    }
                }

                if (isset($itemId['id']) && ($itemId['id'] === $oldToolParentNodeRoot)) {
                    if (is_array($itemId['id'])) {
                        if  (in_array($oldToolParentNodeRoot, $itemId['id'])) {
                            $newRights[$toolNode]['id'] = $newToolParentNodeRoot;
                        }
                    } else {
                        if  (in_array($oldToolParentNodeRoot, $itemId)) {
                            $newRights[$toolNode]['id'] = $newToolParentNodeRoot;
                        }
                    }

                }

            } else {
                $newRights[$toolNode] = $itemId;
            }

            // check if some of the new node parent for left menu is existing
            if ($node === $oldToolParentNode || $node === $newToolParentNode) {
                foreach ($leftMenuToolNodes as $idx => $tool) {
                    if (! isset($itemId[$tool])) {
                        // add the tool node to the left menu node
                        $newRights[$toolNode][$tool] = [];
                        if (isset($sectionItems[$tool])) {
                            $newRights[$toolNode][$tool] = $sectionItems[$tool];
                        }
                    }
                }
            }
        }

        return $newRights;
    }

    /**
     * @param $nodes
     *
     * @return string
     */
    protected function toNewXmlStructure($nodes)
    {
        $tab = "\t";
        $br = PHP_EOL;
        $xml = '<?xml version="1.0" encoding="UTF-8"?><document type="MelisUserRights" author="MelisTechnology" version="2.0">' . $br;
        unset($nodes['@attributes']);

        $newToolParentNode = 'meliscore_leftmenu';

        foreach ($nodes as $keyNode => $node) {

            if ($newToolParentNode !== $keyNode) {
                $xml .= "<$keyNode>$br";
                if (isset($node['id'])) {
                    if (is_array($node['id'])) {
                        foreach ($node['id'] as $item) {
                            $xml .= "$tab<id>$item</id>$br";
                        }
                    } else {
                        $xml .= "$tab<id>$node[id]</id>$br";
                    }

                }
                $xml .= "</$keyNode>$br";
            } else {
                $xml .= "<$newToolParentNode>$br";
                foreach ($node as $parentKeyNode => $tools) {

                    if (is_array($tools)) {
                        $xml .= "$tab<$parentKeyNode>$br";
                        if (isset($tools['id'])) {
                            $tools = array_map(function ($a) use ($tab, $br) {
                                return "$tab$tab<id>$a</id>";
                            }, $tools['id']);

                            $toolItems = implode($br, $tools) . $br;
                            $xml .= "$toolItems";
                        }

                        $xml .= "$tab</$parentKeyNode>$br";
                    } else {
                        $xml .= "$tab<$parentKeyNode>";
                        $xml .= $tools;
                        $xml .= "</$parentKeyNode>$br";
                    }

                }
                $xml .= "</$newToolParentNode>";

            }
        }
        $xml .= $br . '</document>';

        return $xml;
    }

    /**
     * @param $xmlRights
     *
     * @return bool
     */
    public function isRightsUpdated($xmlRights)
    {
        $rights = simplexml_load_string(trim($xmlRights));
        $rights = json_decode(json_encode($rights),1);

        /** @var \MelisCore\Service\MelisCoreRightsService $rights */
        $rightsSvc = $this->getServiceLocator()->get('MelisCoreRights');
        $nodesToCheck = $rightsSvc->getMelisKeyPaths();
        $toolParentNode = $rightsSvc::MELIS_PLATFORM_TOOLS_PREFIX;

        $isToolParentNodeExists = false;
        $isToolChildExistsAndComplete = false;

        foreach ($rights as $keyNode => $node) {
            if ($toolParentNode === $keyNode) {
                $isToolParentNodeExists = true;
                // check for the tool child nodes
                foreach ($node as $toolNodeKey => $toolNode) {
                    if (in_array($toolNodeKey, $nodesToCheck)) {
                        $isToolChildExistsAndComplete = true;
                    } else {
                        $isToolChildExistsAndComplete = false;
                    }
                }
            }
        }

        return $isToolParentNodeExists && $isToolChildExistsAndComplete;
    }


}
