use jsonwebtoken::{encode, decode, Header, Validation, Algorithm, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use crate::models::ScorePayload;

const SESSION_MAX_SECS: u64 = 3600; // 1 hour max session

#[derive(Debug, Serialize, Deserialize)]
struct SessionClaims {
    /// The DB session row ID (UUID string)
    sid: String,
    sub: i64,       // player_id
    level: i64,
    iat: u64,
    exp: u64,
}

#[derive(Debug, Deserialize)]
pub struct ScoreClaims {
    pub player_id: i64,
    pub level: i64,
    pub time_ms: i64,
    pub boxes_broken: i64,
    pub power_ups_collected: i64,
    pub fall_count: i64,
    pub speed_boosts: i64,
    #[serde(default)]
    pub fire_maxed: bool,
    #[serde(default)]
    pub ice_maxed: bool,
}

pub struct AppState {
    jwt_secret: String,
}

impl AppState {
    pub fn new(secret: String) -> Self {
        Self { jwt_secret: secret }
    }

    /// Build the signing key: server_secret + wallet_address
    fn signing_key(&self, wallet_address: &str) -> String {
        format!("{}{}", self.jwt_secret, wallet_address)
    }

    /// Create a session JWT. The session_id must already exist in the DB.
    pub fn create_session_token(
        &self,
        session_id: &str,
        player_id: i64,
        level: i64,
        wallet_address: &str,
    ) -> Result<String, String> {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let claims = SessionClaims {
            sid: session_id.to_string(),
            sub: player_id,
            level,
            iat: now,
            exp: now + SESSION_MAX_SECS,
        };

        let key = self.signing_key(wallet_address);
        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(key.as_bytes()),
        )
        .map_err(|e| format!("failed to create session: {e}"))
    }

    /// Validate a session JWT. Returns (session_id, player_id, level, elapsed_ms).
    pub fn validate_session_token(
        &self,
        token: &str,
        wallet_address: &str,
    ) -> Result<(String, i64, i64, i64), String> {
        let key = self.signing_key(wallet_address);
        let validation = Validation::default();

        let token_data = decode::<SessionClaims>(
            token,
            &DecodingKey::from_secret(key.as_bytes()),
            &validation,
        )
        .map_err(|e| format!("invalid session token: {e}"))?;

        let claims = token_data.claims;
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let elapsed_ms = ((now - claims.iat) * 1000) as i64;
        Ok((claims.sid, claims.sub, claims.level, elapsed_ms))
    }

    /// Decode the client-signed score JWT using the session token string as HMAC key.
    pub fn decode_score_token(
        &self,
        score_token: &str,
        session_token: &str,
    ) -> Result<ScorePayload, String> {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.required_spec_claims = std::collections::HashSet::new();
        validation.validate_exp = false;

        let token_data = decode::<ScoreClaims>(
            score_token,
            &DecodingKey::from_secret(session_token.as_bytes()),
            &validation,
        )
        .map_err(|e| format!("invalid score token: {e}"))?;

        let c = token_data.claims;
        Ok(ScorePayload {
            player_id: c.player_id,
            level: c.level,
            time_ms: c.time_ms,
            boxes_broken: c.boxes_broken,
            power_ups_collected: c.power_ups_collected,
            fall_count: c.fall_count,
            speed_boosts: c.speed_boosts,
            fire_maxed: c.fire_maxed,
            ice_maxed: c.ice_maxed,
        })
    }
}
