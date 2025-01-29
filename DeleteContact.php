<?php

	$inData = getRequestInfo();
    $userId = $inData["userId"];
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$id = $inData["id"];
	
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

	if (empty($id) || empty($userId) || empty($firstName) || empty($lastName)) {
        returnWithError("Missing data: Ensure all fields (userId, firstName, lastName, id) are provided.");
        exit();
    }


	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("delete from Contacts where FirstName like ? AND LastName like ? AND ID like ? AND UserID like ?");
		$stmt->bind_param("ssss", $firstName, $lastName, $id, $userId);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>