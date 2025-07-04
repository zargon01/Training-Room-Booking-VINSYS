variable "aws_region" {
  default = "us-east-1"
}

variable "project_prefix" {
  default = "training-room-app"
}

variable "frontend_bucket_name" {
  default = "${var.project_prefix}-frontend-bucket"
}

variable "backend_key_pair_name" {
  default = "${var.project_prefix}-keypair"
}

variable "instance_type" {
  default = "t3.micro"
}

variable "allowed_ssh_cidr" {
  description = "Your IP for SSH access"
  default     = "0.0.0.0/0"
}
