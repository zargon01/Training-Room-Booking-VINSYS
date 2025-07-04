provider "aws" {
  region = var.aws_region
}

# S3 bucket for static hosting
resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  policy = <<EOF
{
  "Version":"2012-10-17",
  "Statement":[{
     "Sid":"PublicReadGetObject",
     "Effect":"Allow",
     "Principal":"*",
     "Action":"s3:GetObject",
     "Resource":"arn:aws:s3:::${var.frontend_bucket_name}/*"
  }]
}
EOF
}

# CloudFront distribution
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for frontend bucket"
}

resource "aws_cloudfront_distribution" "frontend_cdn" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "s3-frontend"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    target_origin_id = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# EC2 Security Group for backend
resource "aws_security_group" "backend_sg" {
  name        = "backend-sg"
  description = "Allow HTTP, HTTPS, SSH"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Allow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# VPC data source
data "aws_vpc" "default" {
  default = true
}

# EC2 instance for backend
resource "aws_instance" "backend" {
  ami           = var.backend_ami
  instance_type = var.backend_instance_type
  key_name      = var.ec2_key_pair_name
  security_groups = [aws_security_group.backend_sg.name]

  user_data = <<EOF
#!/bin/bash
sudo apt update -y
sudo apt install -y nginx git nodejs npm
cd /home/ubuntu
git clone https://github.com/zargon01/Training-Room-Booking-VINSYS.git
cd Training-Room-Booking-VINSYS/backend
npm install
npm install pm2 -g
export MONGO_URI=${var.mongo_uri}
export JWT_SECRET=${var.jwt_secret}
pm2 start server.js
EOF

  tags = {
    Name = "BackendServer"
  }
}

# Associate Elastic IP
resource "aws_eip" "backend_ip" {
  instance = aws_instance.backend.id
  vpc      = true

  depends_on = [
    aws_instance.backend
  ]
}
