resource "aws_key_pair" "backend_key" {
  key_name   = var.backend_key_pair_name
  public_key = file("~/.ssh/id_rsa.pub")
}

resource "aws_security_group" "backend_sg" {
  name_prefix = "${var.project_prefix}-sg"
  description = "Allow SSH and HTTP traffic"
  ingress = [
    { from_port = 22, to_port = 22, protocol = "tcp", cidr_blocks = [var.allowed_ssh_cidr] },
    { from_port = 80, to_port = 80, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  ]
  egress = [{ from_port = 0, to_port = 0, protocol = "-1", cidr_blocks = ["0.0.0.0/0"] }]
}

resource "aws_instance" "backend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.backend_key.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y awscli
    mkdir -p /home/ubuntu/app
    cd /home/ubuntu/app
    aws ssm get-parameter --name "/${var.project_prefix}/MONGODB_URI" --with-decryption --region ${var.aws_region} --query Parameter.Value --output text >> .env
    aws ssm get-parameter --name "/${var.project_prefix}/JWT_SECRET" --with-decryption --region ${var.aws_region} --query Parameter.Value --output text >> .env
    # Add JQ-based parsing if needed for multiple values
    # Clone repo or copy binaries
    # npm install && npm run start
  EOF

  tags = {
    Name = "${var.project_prefix}-backend"
  }
}

resource "aws_eip" "backend_ip" {
  instance = aws_instance.backend.id
}
