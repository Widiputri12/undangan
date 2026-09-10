<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(mixed $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $serverPdo = new PDO(
        'mysql:host=127.0.0.1;charset=utf8mb4',
        'root',
        'Matahary02@',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $serverPdo->exec('CREATE DATABASE IF NOT EXISTS `undangan` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

    $pdo = new PDO(
        'mysql:host=127.0.0.1;dbname=undangan;charset=utf8mb4',
        'root',
        'Matahary02@',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS wishes (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $pdo->query('SELECT id, name, message, created_at FROM wishes ORDER BY created_at DESC, id DESC LIMIT 100');
        respond($statement->fetchAll());
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond(['error' => 'Method tidak didukung'], 405);
    }

    $payload = json_decode(file_get_contents('php://input'), true);
    $name = trim((string) ($payload['name'] ?? ''));
    $message = trim((string) ($payload['message'] ?? ''));

    if ($name === '' || $message === '') {
        respond(['error' => 'Nama dan ucapan wajib diisi'], 422);
    }
    if (mb_strlen($name) > 100 || mb_strlen($message) > 2000) {
        respond(['error' => 'Ucapan terlalu panjang'], 422);
    }

    $statement = $pdo->prepare('INSERT INTO wishes (name, message) VALUES (:name, :message)');
    $statement->execute(['name' => $name, 'message' => $message]);
    $id = (int) $pdo->lastInsertId();

    $statement = $pdo->prepare('SELECT id, name, message, created_at FROM wishes WHERE id = :id');
    $statement->execute(['id' => $id]);
    respond($statement->fetch(), 201);
} catch (Throwable $error) {
    respond(['error' => 'Koneksi database gagal'], 500);
}
