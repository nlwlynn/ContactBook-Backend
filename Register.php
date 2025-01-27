<?php
    $inData = getRequestInfo();
    
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $login = $inData["login"];
    $password = $inData["password"];

    if (empty($firstName) || empty($lastName) || empty($login) || empty($password)) {
        returnWithError("Missing data");
        exit();
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    
    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login = ?");
        $stmt->bind_param("s", $login);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            returnWithError("User already exists");
        } else {
            $stmt = $conn->prepare("INSERT into Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
            $stmt->execute();
            $id = $conn->insert_id;
            $returnMessage .= '{'.'"User registered successfully, id": "'.$id.''.'"}';
            returnWithInfo($returnMessage);
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err) {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($message) {
        $retValue = '{"message":' . $message . ', "error":""}';
        sendResultInfoAsJson($retValue);
    }
?>
