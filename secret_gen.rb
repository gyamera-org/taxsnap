require "jwt"

key_file = "/Users/josephinegyamera/gyamera-org/hair-deets/debt-free/AuthKey_7CC96MDFC4.p8"
team_id = "2AFY6WW292"
client_id = "com.debt-free.app"
key_id = "7CC96MDFC4"
validity_period = 180 # In days. Max 180 (6 months) according to Apple docs.

private_key = OpenSSL::PKey::EC.new IO.read key_file

token = JWT.encode(
	{
		iss: team_id,
		iat: Time.now.to_i,
		exp: Time.now.to_i + 86400 * validity_period,
		aud: "https://appleid.apple.com",
		sub: client_id
	},
	private_key,
	"ES256",
	header_fields=
	{
		kid: key_id 
	}
)
puts token
