import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as cert from "@aws-cdk/aws-certificatemanager";

type ApiGatewayProps = {
  lambdaFunction: lambda.Function;
  certificate: cert.ICertificate;
  domainName: string;
} & cdk.StackProps;

export class ApiGateway extends cdk.Stack {
  public readonly apigwDomain: apigw.DomainName;
  public readonly healthCheckDomainName: string;
  public readonly api: apigw.LambdaRestApi;

  constructor(scope: cdk.Construct, id: string, props: ApiGatewayProps) {
    super(scope, id, props);

    const { lambdaFunction, certificate, domainName } = props;

    this.api = new apigw.LambdaRestApi(this, `${domainName}lambda-api`, {
      handler: lambdaFunction,
      options: {
        restApiName: domainName,
        defaultCorsPreflightOptions: {
          allowOrigins: ["*"],
          allowHeaders: ["content-type"],
          allowCredentials: true,
        },
        endpointTypes: [apigw.EndpointType.REGIONAL],
        binaryMediaTypes: ["*/*"],
      },
    });

    // `fullyQualifiedDomainName` of healthCheckConfig should be just domain name
    // `this.api.urlForPath()` can be retrun `https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod/`,
    // but this includes `https://` and `/prod`.
    // `this.api.domainName` cannot be used for health check domain
    // that's why domain name for health check should be prepared by myself.
    this.healthCheckDomainName = `${this.api.restApiId}.execute-api.${props.env?.region}.amazonaws.com`;

    this.apigwDomain = new apigw.DomainName(this, `${domainName}ApiDomain`, {
      certificate,
      domainName,
      endpointType: apigw.EndpointType.REGIONAL,
      securityPolicy: apigw.SecurityPolicy.TLS_1_2,
      mapping: this.api,
    });
  }
}
