#!/bin/bash

# Build and push Spring Boot Docker image to ECR
# Usage: ./build-and-push.sh [tag]

set -e

REGION="us-east-2"
TAG="${1:-latest}"

echo "Building and pushing Spring Boot image to ECR..."
echo "Tag: $TAG"
echo ""

# Get ECR repository URI from stack outputs
echo "1. Getting ECR repository URI..."
REPO_URI=$(aws cloudformation describe-stacks \
  --stack-name SSGEcrStack \
  --query "Stacks[0].Outputs[?OutputKey=='RepositoryUri'].OutputValue" \
  --output text \
  --region ${REGION})

if [ -z "$REPO_URI" ]; then
  echo "❌ Error: Could not find ECR repository URI"
  echo "   Make sure SSGEcrStack is deployed"
  exit 1
fi

echo "   Repository: $REPO_URI"
echo ""

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Login to ECR
echo "2. Logging in to ECR..."
aws ecr get-login-password --region ${REGION} | \
  docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

echo "   ✅ Logged in"
echo ""

# Build the image
echo "3. Building Docker image..."
cd ../../backend/nil-api
docker build -t ssg-spring-boot-api:${TAG} .

echo "   ✅ Image built"
echo ""

# Tag the image
echo "4. Tagging image..."
docker tag ssg-spring-boot-api:${TAG} ${REPO_URI}:${TAG}
docker tag ssg-spring-boot-api:${TAG} ${REPO_URI}:latest

echo "   ✅ Image tagged"
echo ""

# Push the image
echo "5. Pushing image to ECR..."
docker push ${REPO_URI}:${TAG}
docker push ${REPO_URI}:latest

echo ""
echo "✅ Image pushed successfully!"
echo ""
echo "Image URI: ${REPO_URI}:${TAG}"
echo ""
echo "To use this image in ECS, reference: ${REPO_URI}:${TAG}"

