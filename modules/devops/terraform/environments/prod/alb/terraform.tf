terraform {
  required_version = "0.14.5"

  backend "s3" {
    bucket = "infra-remotestates"
    key    = "prod/elb"
    region = "ap-southeast-1"
  }
}

provider "aws" {
  region = var.region
}
