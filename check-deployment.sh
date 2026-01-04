#!/bin/bash

# Script to check what AWS infrastructure is currently deployed
# Run this from your terminal

echo "🔍 Checking AWS Infrastructure Deployment Status..."
echo "=================================================="
echo ""

REGION="us-east-2"

echo "1. Checking CloudFormation Stacks (SSG stacks)..."
echo "-------------------------------------------------"
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --region $REGION \
  --query "StackSummaries[?contains(StackName, 'SSG')].{Name:StackName,Status:StackStatus,Created:CreationTime}" \
  --output table 2>&1

echo ""
echo "2. Checking ECS Clusters..."
echo "---------------------------"
aws ecs list-clusters --region $REGION --query "clusterArns" --output table 2>&1

echo ""
echo "3. Checking RDS Databases..."
echo "----------------------------"
aws rds describe-db-instances --region $REGION \
  --query "DBInstances[].{ID:DBInstanceIdentifier,Status:DBInstanceStatus,Endpoint:Endpoint.Address,Engine:Engine}" \
  --output table 2>&1

echo ""
echo "4. Checking ECR Repositories..."
echo "-------------------------------"
aws ecr describe-repositories --region $REGION \
  --query "repositories[].{Name:repositoryName,URI:repositoryUri}" \
  --output table 2>&1

echo ""
echo "5. Checking Load Balancers..."
echo "------------------------------"
aws elbv2 describe-load-balancers --region $REGION \
  --query "LoadBalancers[].{Name:LoadBalancerName,DNS:DNSName,State:State.Code,Type:Type}" \
  --output table 2>&1

echo ""
echo "6. Checking S3 Buckets (SSG related)..."
echo "----------------------------------------"
aws s3 ls | grep -i ssg || echo "No SSG buckets found"

echo ""
echo "✅ Check complete!"
echo ""
echo "Expected stacks if fully deployed:"
echo "  - SSGVpcStack"
echo "  - SSGRdsStack"
echo "  - SSGEcrStack"
echo "  - SSGCacheStack"
echo "  - SSGS3Stack"
echo "  - SSGEcsStack"
echo "  - SSGMonitoringStack"

