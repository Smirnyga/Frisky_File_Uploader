<?php

/*
* Frisky File Uploader Plug-in 1.0
*
* The MIT License (MIT)
*
* Copyright 2015, Ruslan “Smirnyga” Smirnov, https://smirnyga.ru
* 
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

//error_reporting(0);
session_start();
$output_dir = "../temp/";
$upload_dir = "../uploads/";


$part_id = $_POST['part_id'];
$parts = $_POST['parts'];
$file_client = $_POST['file_name'];
if ($_FILES['upload']['error'] != 0)
{
     /*http_response_code(500);*/
    header("HTTP/1.0 404 Not Found");
    exit();
} else
{

    $json_answer = array();


    if (!isset($_SESSION['uploading']))
    {


        if (isset($_COOKIE['uploading']))
        {


            $_SESSION['uploading'] = $_COOKIE['uploading'];
            $_SESSION['file_server'] = $_COOKIE['file_server'];
            $_SESSION['ext'] = $_COOKIE['ext'];
            $_SESSION['file_dir'] = $_COOKIE['file_dir'];


        } else
        {

            $ext = explode('.', $file_client);
            $ext = end($ext);
            $hash = md5(rand(1, 1000) . time());
            $file_server = $hash . '.' . $ext;

            $_SESSION['uploading'] = true;
            $_SESSION['file_server'] = $file_server;
            $_SESSION['ext'] = $ext;
            $_SESSION['file_dir'] = $output_dir . $hash . "/";


            setcookie('uploading', true, time() + (60 * 60 * 24 * 14));
            setcookie('file_server', $file_server, time() + (60 * 60 * 24 * 14));
            setcookie('ext', $ext, time() + (60 * 60 * 24 * 14));
            setcookie('file_dir', $output_dir . $hash . "/", time() + (60 * 60 * 24 * 14));

            mkdir($output_dir . $hash);

            @chmod($output_dir . $hash, 0755);

        }


    }

    $blob = $part_id . '.blob';


    //if(($_FILES["upload"]["size"] == 2097152) || ($part_id == $parts)) {
    move_uploaded_file($_FILES["upload"]["tmp_name"], $_SESSION['file_dir'] . $blob);
    $buffer = file_get_contents($_SESSION['file_dir'] . $blob);
    file_put_contents($upload_dir . $_SESSION['file_server'], $buffer, FILE_APPEND);


    unlink($_SESSION['file_dir'] . $blob);


    if (empty($parts))
    {
        rmdir($_SESSION['file_dir']);
        unlink($upload_dir . $_SESSION['file_server']);


        setcookie('uploading', '', time() - 3600);
        setcookie('file_server', '', time() - 3600);
        setcookie('ext', '', time() - 3600);
        setcookie('file_dir', '', time() - 3600);


        $_SESSION = array();
        if (isset($_COOKIE[session_name()]))
        {
            setcookie(session_name(), '', time() - 3600);
        }
        session_destroy();

    } else
    {
        if ($parts == $part_id)
        {
            rmdir($_SESSION['file_dir']);

            $img = 0;
            if (getimagesize($upload_dir . $_SESSION['file_server']))
            {
                $img = 1;
            }


            $json_answer['file_loaded'] = true;
            $json_answer['file_name'] = $_SESSION['file_server'];
            $json_answer['is_img'] = $img;
            $json_answer['true_file_name'] = $file_client;
            $size = filesize($upload_dir . $_SESSION['file_server']);
            $json_answer['file_size'] = $size;
            $json_answer['file_type'] = $_SESSION['ext'];
            $json_answer['file_date'] = date("Y-m-d");


            setcookie('uploading', '', time() - 3600);
            setcookie('file_server', '', time() - 3600);
            setcookie('ext', '', time() - 3600);
            setcookie('file_dir', '', time() - 3600);

            $_SESSION = array();
            if (isset($_COOKIE[session_name()]))
            {
                setcookie(session_name(), '', time() - 3600);
            }
            session_destroy();

        }
    }
    echo json_encode($json_answer);
}

?>