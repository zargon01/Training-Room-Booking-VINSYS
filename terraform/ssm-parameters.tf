resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/${var.project_prefix}/JWT_SECRET"
  type        = "SecureString"
  value       = var.jwt_secret
}

resource "aws_ssm_parameter" "mongo_uri" {
  name        = "/${var.project_prefix}/MONGODB_URI"
  type        = "SecureString"
  value       = var.mongo_uri
}

