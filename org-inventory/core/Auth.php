<?php

require_once __DIR__ . '/JsonStorage.php';

class Auth
{
    private $storage;

    public function __construct()
    {
        $this->storage = new JsonStorage('users.json');
    }

    public function register($username, $password)
    {
        $users = $this->storage->read();

        foreach ($users as $user) {
            if ($user['username'] === $username) {
                return ['error' => 'Username already exists'];
            }
        }

        $id = count($users) + 1;

        $users[] = [
            'id' => $id,
            'username' => $username,
            'password' => password_hash($password, PASSWORD_BCRYPT),
            'role' => 'member',
            'created_at' => gmdate('c')
        ];

        $this->storage->write($users);

        return ['success' => true];
    }

    public function login($username, $password)
    {
        $users = $this->storage->read();

        foreach ($users as $user) {
            if ($user['username'] === $username &&
                password_verify($password, $user['password'])) {

                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];

                return ['success' => true];
            }
        }

        return ['error' => 'Invalid credentials'];
    }

    public function logout()
    {
        session_destroy();
        return ['success' => true];
    }
}