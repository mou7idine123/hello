<?php
class JwtHandler {
    private $secret;

    public function __construct() {
        // In a real app this should be in an env file.
        $this->secret = 'ihsan_super_secret_key_2026_!@#';
    }

    public function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));

        $payload['iat'] = time();
        $payload['exp'] = time() + (60 * 60 * 24 * 7); // 7 days expiration
        
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public function decode($jwt) {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) != 3) {
            return false;
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signature_provided = $tokenParts[2];

        // Check expiration
        $payloadObj = json_decode($payload);
        if (isset($payloadObj->exp) && $payloadObj->exp < time()) {
            return false; // Expired
        }

        // Verify signature
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if ($base64UrlSignature === $signature_provided) {
            return $payloadObj;
        }
        
        return false;
    }
}
?>
