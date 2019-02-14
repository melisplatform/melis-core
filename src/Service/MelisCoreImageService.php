<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
class MelisCoreImageService implements ServiceLocatorAwareInterface, MelisCoreImageServiceInterface 
{
    const EXT_PNG = 'png';
    const EXT_GIF = 'gif';
    const EXT_JPG = 'jpg';

    public $serviceLocator;
    
    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }
    
    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }
    
    /**
     * Creates a 200x200 image thumbnail
     * @param String $savePath
     * @param String $newImageName
     * @param String $srcImageFile
     * 
     * @return String
     */
    public function createThumbnail($savePath, $newImageName, $srcImageFile)
    {
        $getImageFile = $this->resizeImage($savePath, $srcImageFile, 'tmb_'.$newImageName, 250, 250);
        
        return $getImageFile;
    }
    
    /**
     * Resizes an image
     * @param String $savePath
     * @param String $image
     * @param String $newImageName
     * @param int $width
     * @param int $height
     */
    public function resizeImage($savePath, $image, $newImageName, $width, $height)
    {
        
        $fileImage = $image;
        $outputImg = null;
        $ext = pathinfo($newImageName, PATHINFO_EXTENSION);

        $thumb = imagecreatetruecolor($width, $height);
        list($w, $h) = getimagesize($fileImage);

        switch(exif_imagetype($fileImage)) {
            case IMAGETYPE_GIF:
                $image = imagecreatefromgif($fileImage);
            break;
            case IMAGETYPE_JPEG:
                $image = imagecreatefromjpeg($fileImage);
            break;
            case IMAGETYPE_PNG:
                $image = imagecreatefrompng($fileImage);
            break;
        }
        
        imagecopyresampled($thumb, $image, 0, 0, 0, 0, $width, $height, $w, $h);

        switch ($ext) {
            case self::EXT_PNG:
                $outputImg = imagepng($thumb, $savePath.'/'.$newImageName, 9);
                break;
            case self::EXT_GIF:
                $outputImg = imagegif($thumb, $savePath.'/'.$newImageName);
                break;
            case self::EXT_JPG:
                $outputImg = imagejpeg($thumb, $savePath.'/'.$newImageName, 100);
                break;
        }

        imagedestroy($thumb);
    
    }
}
