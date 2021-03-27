import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
import { ApiGateway } from "./api-gateway";

type DnsProps = {
  hostedZoneId: string;
} & cdk.StackProps;

export class PublicDns extends cdk.Stack {
  public readonly hostedZone: route53.IHostedZone;

  constructor(scope: cdk.App, id: string, props: DnsProps) {
    super(scope, id, props);
    const { hostedZoneId } = props;

    // Get existing HostedZone
    this.hostedZone = route53.HostedZone.fromHostedZoneId(
      this,
      "PublicHostedZone",
      hostedZoneId
    );

    // Or, create new hostzone
    // this.hostedZone = new route53.HostedZone(this, "PublicHostedZone", {
    //   zoneName: example-dummy-domain.com,
    // });
  }
}

type ApiGwDnsProps = {
  hostedZone: route53.IHostedZone;
  apiGateway: ApiGateway;
  failoverType: "PRIMARY" | "SECONDARY";
} & cdk.StackProps;

export class ApiGwDns extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ApiGwDnsProps) {
    super(scope, id, props);

    const {
      hostedZone,
      failoverType,
      apiGateway: { apigwDomain, healthCheckDomainName },
    } = props;

    const healthCheck = new route53.CfnHealthCheck(this, "healthCheck", {
      healthCheckConfig: {
        type: "HTTPS",
        fullyQualifiedDomainName: healthCheckDomainName,
        port: 443,
        resourcePath: "/prod/", // This should be set by props
        //  The following settings are for quick switching in case of failover.
        requestInterval: 10,
        failureThreshold: 1,
        regions: ["ap-northeast-1", "ap-southeast-1", "ap-southeast-2"],
      },
    });

    new route53.CfnRecordSet(this, "RecordSet", {
      name: apigwDomain.domainName,
      type: route53.RecordType.A,
      aliasTarget: {
        dnsName: apigwDomain.domainNameAliasDomainName,
        hostedZoneId: apigwDomain.domainNameAliasHostedZoneId,
        evaluateTargetHealth: true,
      },
      failover: failoverType,
      healthCheckId: healthCheck.attrHealthCheckId,
      hostedZoneId: hostedZone.hostedZoneId, // Exactly one of HostedZoneId and HostedZoneName must be specified
      setIdentifier: id,
    });
  }
}
