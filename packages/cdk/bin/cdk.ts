#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { ApiGwDns, PublicDns } from "../lib/dns";
import { Certmgr } from "../lib/certmanager";
import { Lambda } from "../lib/lambda";
import { ApiGateway } from "../lib/api-gateway";
import { API_DOMAIN_NAME, DOMAIN_NAME, HOSTED_ZONE_ID } from "../lib/config";

const app = new cdk.App();

// Default environment
const env: cdk.Environment = {
  region: "ap-northeast-1",
};

// Dns stacks
const publicDns = new PublicDns(app, `PublicDns`, {
  env,
  hostedZoneId: HOSTED_ZONE_ID,
});

const apNortheast1certmgr = new Certmgr(app, `apNortheast1certmgr`, {
  domainName: DOMAIN_NAME,
  env,
});

const apNortheast3certmgr = new Certmgr(app, `apNortheast3certmgr`, {
  domainName: DOMAIN_NAME,
  env: {
    region: "ap-northeast-3",
  },
});

// Lambda stacks
const tokyoLambda = new Lambda(app, "TokyoLambda", {
  env,
  code: lambda.Code.fromAsset(`${__dirname}/../../backend/src`),
  functionName: "tokyo-lambda",
  handler: "tokyo.handler",
});

const osakaLambda = new Lambda(app, "OsakaLambda", {
  env: {
    region: "ap-northeast-3",
  },
  code: lambda.Code.fromAsset(`${__dirname}/../../backend/src`),
  functionName: "osaka-lambda",
  handler: "osaka.handler",
});

// ApiGateway settings
const tokyoApi = new ApiGateway(app, `TokyoApiGateway`, {
  env,
  certificate: apNortheast1certmgr.certificate,
  domainName: API_DOMAIN_NAME,
  lambdaFunction: tokyoLambda.lambdaFunction,
});

const osakaApi = new ApiGateway(app, `OsakaApiGateway`, {
  env: {
    region: "ap-northeast-3",
  },
  certificate: apNortheast3certmgr.certificate,
  domainName: API_DOMAIN_NAME,
  lambdaFunction: osakaLambda.lambdaFunction,
});

// Failover stacks
new ApiGwDns(app, "ApiGwDnsPrimary", {
  env,
  hostedZone: publicDns.hostedZone,
  apiGateway: tokyoApi,
  failoverType: "PRIMARY",
});

new ApiGwDns(app, "ApiGwDnsSecondary", {
  env: {
    region: "ap-northeast-3",
  },
  hostedZone: publicDns.hostedZone,
  apiGateway: osakaApi,
  failoverType: "SECONDARY",
});
