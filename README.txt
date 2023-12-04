Sample Code:


function send_data_to_google_sheet($municipality_id, $data, $batchSize = 200) {
    $webAppUrl = '<APP_SCRIPT_URI>';

    $columnTitles = $data['columnTitles'];
    $weekDate = $data['weekDate'];
    $dataRows = $data['data'];
    $productRows = $data['products'];

    // Split the data rows into batches
    $batches = array_chunk($dataRows, $batchSize);
    $productBatches = array_chunk($productRows, $batchSize);
    $successfulBatches = [];

    foreach ($batches as $key => $batch) {
        $postData = json_encode([
            'columnTitles' => $columnTitles,
            'data' => $batch,
            'weekDate' => $weekDate
        ]);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $webAppUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 

        // response from app script
        $response = curl_exec($ch);
        curl_close($ch);
    }

    return $successfulBatches;
}