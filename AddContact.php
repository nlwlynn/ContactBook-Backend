<?php

    $inData = getRequestInfo();
    
    // Extract variables from JSON request
    $userId = $inData["userId"];
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $phone = $inData["phone"];
    $email = $inData["email"];

    if (empty($userId) || empty($firstName) || empty($lastName) || empty($phone) || empty($email)) {
        returnWithError("Missing data: Ensure all fields (userId, firstName, lastName, phone, email) are provided.");
        exit();
    }

    // Connect to the database
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    // Debugging: Check the connection status
    if ($conn->connect_error) {
        returnWithError("Database connection failed: " . $conn->connect_error);
        exit();
    }

    // Debugging: Successful connection
    echo "Database connected successfully.\n";

    // Prepare and execute SQL statement
    $stmt = $conn->prepare("INSERT INTO Contacts (userId, firstName, lastName, phone, email) VALUES (?, ?, ?, ?, ?)");

    // Check for prepare errors
    if (!$stmt) {
        returnWithError("Prepare statement failed: " . $conn->error);
        exit();
    }

    $stmt->bind_param("sssss", $userId, $firstName, $lastName, $phone, $email);
    echo "Binding values: userId=$userId, firstName=$firstName, lastName=$lastName, phone=$phone, email=$email\n";

    // Execute SQL statement
    if (!$stmt->execute()) {
        returnWithError("Execute failed: " . $stmt->error);
        $stmt->close();
        $conn->close();
        exit();
    }

    // Successful execution
    $stmt->close();
    $conn->close();
    returnWithMessage("Contact added successfully.");

    // Helper function to parse JSON request
    function getRequestInfo() {
        $data = file_get_contents('php://input');
        $decoded = json_decode($data, true);

        if ($decoded === null) {
            returnWithError("Invalid JSON: " . $data);
            exit();
        }

        return $decoded;
    }

    // Helper function to send JSON response
    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo $obj;
    }

    // Helper function for error responses
    function returnWithError($err) {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    // Helper function for success responses
    function returnWithMessage($message) {
        $retValue = '{"message":"' . $message . '", "error":""}';
        sendResultInfoAsJson($retValue);
    }
?>
