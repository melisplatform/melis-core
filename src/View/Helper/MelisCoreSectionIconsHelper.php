<?php

namespace MelisCore\View\Helper;

use Zend\View\Helper\AbstractHelper;
use MelisCore\Library\MelisAppConfig;

class MelisCoreSectionIconsHelper extends AbstractHelper
{
	public $serviceManager;

	public function __construct($sm)
	{
		$this->serviceManager = $sm;
	}
	
	public function __invoke($marketPlaceSection)
	{
        $openTagSvg = '<div class="pull-left melis-logo" data-dash-icon="fa-tachometer" data-dash-name="MelisCore" data-dash-id="id_meliscore_toolstree_section_dashboard" style="margin-top: -2px;margin-right:9px;"><svg class="melis-icon" style="width:30px;height:30px;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 30 30" enable-background="new 0 0 30 30" xml:space="preserve">';
        $svgIcon    = "";
        if ($marketPlaceSection == 'MelisCore') {
            $svgIcon = '<g>
                            <rect class="bg-color" y="0.1" fill="#ee6622" width="30" height="30"></rect>
                            <rect class="light-color" x="14.6" y="2.7" fill="#f7962d" width="12.7" height="24.6"></rect>
                            <g>
                                <path fill="#FFFFFF" d="M7.4,21.1V9.5H22v11.7h-2.9v-8.8h-2.9v8.8h-2.9v-8.8h-2.9v8.8H7.4z"></path>
                            </g>
                        </g>';
        } else if ($marketPlaceSection == 'MelisCms') {
            $svgIcon = '<g>
                             <rect class="bg-color" y="0.1" fill="#69b344" width="30" height="30"></rect>
                             <rect class="light-color" x="14.6" y="2.7" fill="#85c555" width="12.7" height="24.6"></rect>
                             <g>
                                <path fill="#FFFFFF" d="M7.4,21.1V9.5H22v11.7h-2.9v-8.8h-2.9v8.8h-2.9v-8.8h-2.9v8.8H7.4z"></path>
                             </g>
                        </g>';
        } else if ($marketPlaceSection == 'MelisMarketing') {
            $svgIcon = ' <g>
                             <rect class="bg-color" y="0.1" fill="#70469c" width="30" height="30"></rect>
                             <rect class="light-color" x="14.6" y="2.7" fill="#8965ad" width="12.7" height="24.6"></rect>
                             <g>
                                <path fill="#FFFFFF" d="M7.4,21.1V9.5H22v11.7h-2.9v-8.8h-2.9v8.8h-2.9v-8.8h-2.9v8.8H7.4z"></path>
                             </g>
                          </g>';
        } else if ($marketPlaceSection == 'MelisCommerce') {
            $svgIcon = '<g>
                          <rect class="bg-color" y="0.1" fill="#3997d4" width="30" height="30"></rect>
                          <rect class="light-color" x="14.6" y="2.7" fill="#2780c4" width="12.7" height="24.6"></rect>
                          <g>
                             <path fill="#FFFFFF" d="M7.4,21.1V9.5H22v11.7h-2.9v-8.8h-2.9v8.8h-2.9v-8.8h-2.9v8.8H7.4z"></path>
                          </g>
                       </g>';
        } else if ($marketPlaceSection == 'CustomProjects') {
            $svgIcon = '<g>
                          <rect class="bg-color" y="0.1" fill="#676767" width="30" height="30"></rect>
                          <rect class="light-color" x="14.6" y="2.7" fill="#777777" width="12.7" height="24.6"></rect>
                          <g>
                             <path fill="#FFFFFF" d="M7.4,21.1V9.5H22v11.7h-2.9v-8.8h-2.9v8.8h-2.9v-8.8h-2.9v8.8H7.4z"></path>
                          </g>
                       </g>';
        } else {
            $svgIcon = '<g>
                             <rect class="bg-color" y="0.1" fill="#C52127" width="30" height="30"></rect>
                             <rect class="light-color" x="14.6" y="2.7" fill="#E71E26" width="12.7" height="24.6"></rect>
                             <g>
                                <path fill="#FFFFFF" d="M7.4,21.1V9.5H22v11.7h-2.9v-8.8h-2.9v8.8h-2.9v-8.8h-2.9v8.8H7.4z"></path>
                             </g>
                          </g>';
        }

        $closeTagSVg = '</svg></div>';

        return $openTagSvg . $svgIcon . $closeTagSVg;
	}
}