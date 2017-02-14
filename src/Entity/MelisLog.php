<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Entity;

class MelisLog
{
	protected $id;
	protected $log;
	protected $type;
	protected $translations;

	public function getId()
	{
	    return $this->id;
	}
	
	public function setId($id)
	{
	    $this->id = $id;
	}
	
	public function setLog($log)
	{
	    $this->log = $log;
	}
	
	public function getLog()
	{
	    return $this->log;
	}
	
	public function setType($type)
	{
	    $this->type = $type;
	}
	
	public function getType()
	{
	    return $this->type;
	}
	
	public function getTranslations()
	{
	    return $this->translations;
	}
	
	public function setTranslations($translations)
	{
	    $this->translations = $translations;
	}
	
    public function getArrayCopy()
    {
        return get_object_vars($this);
    }
}