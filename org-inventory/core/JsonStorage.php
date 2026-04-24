<?php

class JsonStorage
{
    private $file;

    public function __construct($filename)
    {
        $this->file = DATA_PATH . $filename;

        if (!file_exists($this->file)) {
            file_put_contents($this->file, json_encode([], JSON_PRETTY_PRINT));
        }
    }

    public function read()
    {
        $fp = fopen($this->file, 'r');
        flock($fp, LOCK_SH);
        $data = json_decode(file_get_contents($this->file), true);
        flock($fp, LOCK_UN);
        fclose($fp);

        return $data ?? [];
    }

    public function write($data)
    {
        $fp = fopen($this->file, 'w');
        flock($fp, LOCK_EX);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}