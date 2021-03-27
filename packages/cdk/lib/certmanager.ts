import * as certmgr from "@aws-cdk/aws-certificatemanager";
import * as cdk from "@aws-cdk/core";

type CertmgrProps = {
  domainName: string;
} & cdk.StackProps;

export class Certmgr extends cdk.Stack {
  public readonly certificate: certmgr.ICertificate;
  constructor(scope: cdk.App, id: string, props: CertmgrProps) {
    super(scope, id, props);

    const { domainName } = props;

    this.certificate = new certmgr.Certificate(this, "Certificate", {
      domainName: `*.${domainName}`,
      validation: certmgr.CertificateValidation.fromDns(), // Records must be added manually
    });
  }
}
