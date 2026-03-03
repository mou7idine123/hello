<?php
require_once 'JwtHandler.php';

class AuthMiddleware {
    public static function checkToken() {
        $headers = apache_request_headers();
        $authHeader = null;
        
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        } else if (isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } else if (isset($_GET['token'])) {
            $authHeader = 'Bearer ' . $_GET['token'];
        }

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(["message" => "Unauthorized: No token provided"]);
            exit;
        }

        $jwt = $matches[1];
        $jwtHandler = new JwtHandler();
        $decoded = $jwtHandler->decode($jwt);

        if (!$decoded) {
            http_response_code(401);
            echo json_encode(["message" => "Unauthorized: Invalid or expired token"]);
            exit;
        }

        return $decoded; // Returns payload object (data)
    }

    public static function checkRole($requiredRoles) {
        $user = self::checkToken();
        if (!in_array($user->role, $requiredRoles)) {
            http_response_code(403);
            echo json_encode(["message" => "Forbidden: Insufficient role"]);
            exit;
        }
        return $user;
    }
}

// Fallback for apache_request_headers if using built-in PHP server
if (!function_exists('apache_request_headers')) {
    function apache_request_headers() {
        $arach = array();
        $rx_http = '/\AHTTP_/';
        foreach($_SERVER as $key => $val) {
            if(preg_match($rx_http, $key)) {
                $arach_key = preg_replace($rx_http, '', $key);
                $rx_matches = array();
                $rx_matches = explode('_', $arach_key);
                if(count($rx_matches) > 0 and strlen($arach_key) > 2) {
                    foreach($rx_matches as $ak_key => $ak_val) $rx_matches[$ak_key] = ucfirst(strtolower($ak_val));
                    $arach_key = implode('-', $rx_matches);
                }
                $arach[$arach_key] = $val;
            }
        }
        return $arach;
    }
}
?>
