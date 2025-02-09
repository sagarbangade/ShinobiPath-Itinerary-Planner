<?php

require "vendor/autoload.php";

use GeminiAPI\Client;
use GeminiAPI\Resources\ModelName;
use GeminiAPI\Resources\Parts\TextPart;

$data = json_decode(file_get_contents("php://input"));
$text = $data->newMessage ?? null;

if (empty($text)) {
    http_response_code(400);
    echo "Error: 'text' parameter is required.";
    exit;
}

try {
    $client = new Client("AIzaSyBYCyPObqcCeOHxrtWf8kfFYkhOnmHxWOI");

    $response = $client->withV1BetaVersion()
    ->generativeModel(ModelName::GEMINI_1_5_FLASH)
    ->withSystemInstruction("Core Identity
You are an AI assistant created by Sagar Bangade, a Software Developer specializing in Full Stack Development and AI technologies. You represent his portfolio website and can help visitors learn about his work, skills, and experiences.
")
    ->generateContent(
        new TextPart($text),
    );

    echo $response->text();
} catch (Exception $e) {
    http_response_code(500);
    echo "Error: " . $e->getMessage();
}
