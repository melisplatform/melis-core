<?php
	
namespace MelisCore\Service;

interface MelisCoreImageServiceInterface 
{
    public function createThumbnail($savePath, $newImageName, $srcImageFile);
    
}