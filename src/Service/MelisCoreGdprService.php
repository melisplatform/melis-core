<?php

namespace MelisCore\Service;

use MelisCore\Service\MelisCoreGeneralService;
use Laminas\Http\PhpEnvironment\Response as HttpResponse;

class MelisCoreGdprService extends MelisCoreGeneralService {

    /**
     * This will send an event that will get all the user's information based on the form inputs and Returns the retrieved user's info
     *
     * This event will take in the form inputs as the parameters so please follow this structure.
     * Parameter for the event value structure:
     *
     * array(
     *   'search' => array(
     *     'user_name'  => 'Doe',
     *     'user_email' => 'john@doe.com,
     *     'site'       => 2 //siteId,
     *     etc ..,
     *   ),
     * )
     *
     * The modules that will catch the event will then provide their results using this structure.
     * Return value structure:
     *
     * array(
     *   'results' => array(
     *     'MelisCmsProspects' => array(),
     *     'MelisCmsNewsletters' => array(),
     *     etc ..,
     *   )
     * )
     *
     * Inside every module, there will be this structure to follow to be displayed then as a table
     *
     * array(
     *   'results' => array(
     *      'MelisCmsProspects' => array(
     *        'icon' => '...',
     *        'moduleName' => 'MelisCmsProspects',
     *
     *        'values' => array(
     *           ...
     *        ),
     *      ),
     *   ),
     * )
     *
     * Inside the values array there will be this structure to follow
     *
     * 'values' => array(
     *    'columns' => array(
     *       //IDs and checkbox will be provided already in the table
     *       'name' => array(
     *          'id' => 'meliscmsprospects_col_name',
     *          'text' => 'Name'
     *       ),
     *       'email' => array(
     *          'id' => 'meliscmsprospects_col_email',
     *          'text' => 'Email'
     *       ),
     *       'date' => array(
     *          'id' => 'meliscmsprospects_col_date',
     *          'text' => 'Date'
     *       ),
     *    ),
     *    'datas' => array(
     *       '13' => array(
     *          'name' => 'Doe',
     *          'email' => 'Doe@John.com'
     *          'date' => 11/13/2017 13:13:00
     *       ),
     *       '15' => array(
     *          'name' => 'Doe',
     *          'email' => 'Doe@John2.com'
     *          'date' => 11/15/2017 15:15:00
     *       ),
     *    ),
     * ),
     *
     * The key of the items in the datas array is the ID of the item and it must be unique.
     *
     * @param array formInputs
     *
     * @return array
     */
    public function getUserInfo($formInputs = [])
    {
        // Create search index for the array
        $arrayParameters['search'] = $formInputs;

        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_user_info_event', $arrayParameters);

        return $arrayParameters;
    }

    /**
     * This function will Retrieve xml string of user's info based on the ids passed
     * and Returns a xml string containing all modules that matched the ids passed
     *
     * This event will take in the IDs of the selected items on the table as the parameters so please follow this structure.
     * Parameter for the event value structure:
     *
     * array(
     *   'selected' => array(
     *     'MelisCmsProspects'  => array(13,15),
     *     'MelisCmsNewsletter' => 'array(2),
     *   ),
     * )
     *
     * The modules that will catch the event will then provide their own results using this structure.
     * Return value structure:
     *
     * array(
     *   'selected' => array(
     *     'MelisCmsProspects'  => '<xml><MelisCmsProspects>...</MelisCmsProspects></xml>',
     *     'MelisCmsNewsletter' => '<xml><MelisCmsNewsletter>...</MelisCmsNewsletter></xml>',
     *   ),
     * )
     *
     * @param (array) $arrayParameters
     * @return (string) xml string
     */
    public function extractSelected($idsToBeExtractedArray = [])
    {
        //created selected index
        $arrayParameters['selected'] = $idsToBeExtractedArray;

        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_user_extract_event', $arrayParameters);

        $xml = '';

        if (isset($arrayParameters['results']) && count($arrayParameters['results']) > 0) {
            // Generate and structure the xml
            $xmlDoc = new \DOMDocument('1.0', 'UTF-8');
            $xmlDoc->formatOutput = true;
            $root = $xmlDoc->appendChild($xmlDoc->createElement("xml"));

            $doc = new \DOMDocument();
            $doc->formatOutput = true;

            foreach ($arrayParameters['results'] as $key => $value) {
                $doc->loadXML($value);

                //remove root element xml so that we won't have multiple xml elements on the final output
                $module = $doc->documentElement->getElementsByTagName('*')->item(0);
                $doc->replaceChild($module, $doc->documentElement);

                $xml = $doc->saveXML($doc->documentElement);

                //append each modules xml to one final xml
                $fragment = $xmlDoc->createDocumentFragment();
                $fragment->appendXML($xml);
                $xmlDoc->documentElement->appendChild($fragment);
            }

            $xml = $xmlDoc->saveXML();
        }

        // Sending service end event
        //$arrayParameters = $this->sendEvent('melis_core_gdpr_user_extract_event_end', $xml);
        return $xml;
    }

    /**
     * This function will delete all ids passed and
     *
     * This event will take in the IDs of the selected items on the table as the parameters so please follow this structure.
     * Parameter for the event value structure:
     *
     * array(
     *   'selected' => array(
     *     'MelisCmsProspects'  => array(13,15),
     *     'MelisCmsNewsletter' => 'array(2),
     *   ),
     * )
     * *
     * The modules that will catch the event will then return an acknowledgement message if the items are succesfully deleted.
     * Return value structure:
     *
     * array(
     *   'results' => array(
     *     'MelisCmsProspects'  => true,
     *     'MelisCmsNewsletter' => true,
     *   ),
     * )
     *
     * @param $arrayParameters
     * @return array
     */
    public function deleteSelected($idsToBeDeletedArray = [])
    {
        // Create selected index for the array
        $arrayParameters['selected'] = $idsToBeDeletedArray;

        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_user_delete_event', $arrayParameters);

        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_user_delete_event_end', $arrayParameters);

        return $arrayParameters;
    }
}