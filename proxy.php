<?php

	$contents = "";

	$url = "colours.conf";

	try
	{
		$contents = file_get_contents($url);
	}
	catch(Exception $ex)
	{}

	echo $contents;
?>