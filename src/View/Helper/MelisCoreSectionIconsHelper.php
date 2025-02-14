<?php

namespace MelisCore\View\Helper;

use Laminas\ServiceManager\ServiceManager;
use Laminas\View\Helper\AbstractHelper;
use MelisCore\Library\MelisAppConfig;

class MelisCoreSectionIconsHelper extends AbstractHelper
{
	public $serviceManager;

	public function setServiceManager(ServiceManager $serviceManager)
	{
		$this->serviceManager = $serviceManager;
	}
	
	public function __invoke($marketPlaceSection)
	{
         // data-dash-icon="fa-tachometer" data-dash-name="MelisCore" data-dash-id="id_meliscore_toolstree_section_dashboard" style="margin-top: -2px;margin-right:9px;"
         $openTagSvg = '<div class="float-left melis-logo"><svg class="melis-icon" style="width:30px;height:30px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">';
         $svgIcon    = "";
         if ($marketPlaceSection == 'MelisCore') {
            $svgIcon = '<rect fill="#ee6622" x=".07" y=".13" width="79.86" height="79.86" rx="15.36" ry="15.36"/>
                        <g>
                           <path fill="#FFFFFF" d="M57.78,15.87c-3.47,0-6.29,2.81-6.29,6.29v35.85c0,3.47,2.81,6.29,6.29,6.29s6.29-2.81,6.29-6.29V22.16c0-3.47-2.81-6.29-6.29-6.29Z"/>
                           <path fill="#FFFFFF" d="M27.79,19.16c-1.62-3.07-5.43-4.24-8.5-2.62-3.07,1.62-4.24,5.43-2.62,8.5l19.01,35.93c1.62,3.07,5.43,4.24,8.5,2.62,3.07-1.62,4.24-5.43,2.62-8.5L27.79,19.16Z"/>
                           <circle fill="#FFFFFF" cx="22.36" cy="57.88" r="6.43"/>
                        </g>';
         } else if ($marketPlaceSection == 'MelisCms') {
            $svgIcon = '<rect fill="#69b344" x=".07" y=".13" width="79.86" height="79.86" rx="15.36" ry="15.36"/>
                        <g>
                           <path fill="#FFFFFF" d="M57.78,15.87c-3.47,0-6.29,2.81-6.29,6.29v35.85c0,3.47,2.81,6.29,6.29,6.29s6.29-2.81,6.29-6.29V22.16c0-3.47-2.81-6.29-6.29-6.29Z"/>
                           <path fill="#FFFFFF" d="M27.79,19.16c-1.62-3.07-5.43-4.24-8.5-2.62-3.07,1.62-4.24,5.43-2.62,8.5l19.01,35.93c1.62,3.07,5.43,4.24,8.5,2.62,3.07-1.62,4.24-5.43,2.62-8.5L27.79,19.16Z"/>
                           <circle fill="#FFFFFF" cx="22.36" cy="57.88" r="6.43"/>
                        </g>';
         } else if ($marketPlaceSection == 'MelisMarketing') {
            $svgIcon = '<rect fill="#70469c" x=".07" y=".13" width="79.86" height="79.86" rx="15.36" ry="15.36"/>
                        <g>
                           <path fill="#FFFFFF" d="M57.78,15.87c-3.47,0-6.29,2.81-6.29,6.29v35.85c0,3.47,2.81,6.29,6.29,6.29s6.29-2.81,6.29-6.29V22.16c0-3.47-2.81-6.29-6.29-6.29Z"/>
                           <path fill="#FFFFFF" d="M27.79,19.16c-1.62-3.07-5.43-4.24-8.5-2.62-3.07,1.62-4.24,5.43-2.62,8.5l19.01,35.93c1.62,3.07,5.43,4.24,8.5,2.62,3.07-1.62,4.24-5.43,2.62-8.5L27.79,19.16Z"/>
                           <circle fill="#FFFFFF" cx="22.36" cy="57.88" r="6.43"/>
                        </g>';
         } else if ($marketPlaceSection == 'MelisCommerce') {
            $svgIcon = '<rect fill="#2780c4" x=".07" y=".13" width="79.86" height="79.86" rx="15.36" ry="15.36"/>
                        <g>
                           <path fill="#FFFFFF" d="M57.78,15.87c-3.47,0-6.29,2.81-6.29,6.29v35.85c0,3.47,2.81,6.29,6.29,6.29s6.29-2.81,6.29-6.29V22.16c0-3.47-2.81-6.29-6.29-6.29Z"/>
                           <path fill="#FFFFFF" d="M27.79,19.16c-1.62-3.07-5.43-4.24-8.5-2.62-3.07,1.62-4.24,5.43-2.62,8.5l19.01,35.93c1.62,3.07,5.43,4.24,8.5,2.62,3.07-1.62,4.24-5.43,2.62-8.5L27.79,19.16Z"/>
                           <circle fill="#FFFFFF" cx="22.36" cy="57.88" r="6.43"/>
                        </g>';
         } else if ($marketPlaceSection == 'CustomProjects') {
            $svgIcon = '<rect fill="#676767" x=".07" y=".13" width="79.86" height="79.86" rx="15.36" ry="15.36"/>
                        <g>
                           <path fill="#FFFFFF" d="M57.78,15.87c-3.47,0-6.29,2.81-6.29,6.29v35.85c0,3.47,2.81,6.29,6.29,6.29s6.29-2.81,6.29-6.29V22.16c0-3.47-2.81-6.29-6.29-6.29Z"/>
                           <path fill="#FFFFFF" d="M27.79,19.16c-1.62-3.07-5.43-4.24-8.5-2.62-3.07,1.62-4.24,5.43-2.62,8.5l19.01,35.93c1.62,3.07,5.43,4.24,8.5,2.62,3.07-1.62,4.24-5.43,2.62-8.5L27.79,19.16Z"/>
                           <circle fill="#FFFFFF" cx="22.36" cy="57.88" r="6.43"/>
                        </g>';
         } else {
            $svgIcon = '<rect fill="#ff0000" x=".07" y=".13" width="79.86" height="79.86" rx="15.36" ry="15.36"/>
                        <g>
                           <path fill="#FFFFFF" d="M57.78,15.87c-3.47,0-6.29,2.81-6.29,6.29v35.85c0,3.47,2.81,6.29,6.29,6.29s6.29-2.81,6.29-6.29V22.16c0-3.47-2.81-6.29-6.29-6.29Z"/>
                           <path fill="#FFFFFF" d="M27.79,19.16c-1.62-3.07-5.43-4.24-8.5-2.62-3.07,1.62-4.24,5.43-2.62,8.5l19.01,35.93c1.62,3.07,5.43,4.24,8.5,2.62,3.07-1.62,4.24-5.43,2.62-8.5L27.79,19.16Z"/>
                           <circle fill="#FFFFFF" cx="22.36" cy="57.88" r="6.43"/>
                        </g>';
         }

         $closeTagSVg = '</svg></div>';

         return $openTagSvg . $svgIcon . $closeTagSVg;
	}
}