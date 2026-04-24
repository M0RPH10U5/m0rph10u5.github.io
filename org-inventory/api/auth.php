<?php

require_once '../config/config.php';
require_once '../core/Auth.php';

$auth = new Auth();
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

    case 'register':

        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        $errors = [];

        if (!$username) $errors[] = 'Username required';
        if (!$password) $errors[] = 'Password required';

        if (strlen($username) > 50)
            $errors[] = 'Username too long';

        if (strlen($password) < 6)
            $errors[] = 'Password must be at least 6 characters';

        if (!empty($errors)) {
            jsonResponse(false, 'Validation failed', null, $errors);
        }

        $result = $auth->register($username, $password);

        if (isset($result['error'])) {
            jsonResponse(false, 'Registration failed', null, [$result['error']]);
        }

        jsonResponse(true, 'Registration successful');
        break;


    case 'login':

        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        if (!$username || !$password) {
            jsonResponse(false, 'Missing credentials', null, ['Username and password required']);
        }

        $result = $auth->login($username, $password);

        if (isset($result['error'])) {
            jsonResponse(false, 'Login failed', null, [$result['error']]);
        }

        jsonResponse(true, 'Login successful', [
            'username' => $_SESSION['username']
        ]);
        break;


    case 'logout':
        $auth->logout();
        jsonResponse(true, 'Logged out');
        break;


    case 'session':
        if (isset($_SESSION['user_id'])) {
            jsonResponse(true, 'Active session', [
                'user_id' => $_SESSION['user_id'],
                'username' => $_SESSION['username']
            ]);
        }

        jsonResponse(false, 'No active session');
        break;


    default:
        jsonResponse(false, 'Invalid action', null, ['Unknown action']);
}