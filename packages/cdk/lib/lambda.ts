import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type LambdaProps = {
  code: lambda.Code;
  functionName: string;
  handler: string;
} & cdk.StackProps;

export class Lambda extends cdk.Stack {
  lambdaFunction: lambda.Function;
  constructor(scope: cdk.Construct, id: string, props: LambdaProps) {
    super(scope, id, props);

    const { code, functionName, handler } = props;

    this.lambdaFunction = new lambda.Function(this, "switching-lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      functionName,
      code,
      handler,
    });
  }
}
