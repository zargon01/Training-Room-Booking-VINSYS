output "frontend_bucket" {
  value = aws_s3_bucket.frontend.website_endpoint
}

output "cloudfront_url" {
  value = aws_cloudfront_distribution.frontend_cf.domain_name
}

output "backend_public_ip" {
  value = aws_eip.backend_ip.public_ip
}
