# Memo
-  `❌  OsakaLambda failed: Error: This stack uses assets, so the toolkit stack must be deployed to the environment (Run "cdk bootstrap aws://unknown-account/ap-northeast-3")`
- `yarn run cdk bootstrap aws://XXXXXXXXXXXX/ap-northeast-3 --profile cdk-user`

- `The certificate provided must be owned by the account creating the domain. (Service: AmazonApiGateway; Status Code: 400; Error Code: BadRequestException; Request ID: 98847e6f-acb9-4930-9f51-d4edc35154c1; Proxy: null)`


- `Exactly one of HostedZoneId and HostedZoneName must be specified`

- `Invalid request: Missing field 'SetIdentifier' in Change with [Action=CREATE, Name=recordset., Type=A, SetIdentifier=null] (Service: AmazonRoute53; Status Code: 400; Error Code: InvalidInput; Request ID: ba789a1c`
- https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/aws-properties-route53-recordset.html#cfn-route53-recordset-setidentifier 


- `[Tried to create an alias that targets api-tokyo.mitsuna.dev., type A in zone Z2VMBZHNOT9Q1U, but that target was not found, RRSet with DNS name recordset. is not permitted in zone mitsuna.dev.]`
- https://stackoverflow.com/questions/11420063/rrset-with-dns-name-foo-is-not-permitted-in-zone-bar
- `regionalDomainName` を指定する必要がある

- https://michimani.net/post/aws-setup-apigateway-custom-domain-using-cloudformation/

- `[RRSet with DNS name recordset. is not permitted in zone mitsuna.dev.]`
```
new route53.CfnRecordSet(this, "RecordSet", {
  name: ... <- ここをちゃんと意図してるレコード名を記載する必要がある
}
```

- recordsetでコケ続ける
  - エンドポイントの指定の仕方がわからなかった

- healthcheckの料金
  - https://aws.amazon.com/jp/route53/pricing/

- `Route 53 がエンドポイントから応答を受け取ってから、次のヘルスチェックリクエストを送信するまでの秒数。一般的には、約 15 個のヘルスチェッカーによって、指定したエンドポイントの正常性が確認されます。30 秒の間隔を選択した場合、エンドポイントは 2、3 秒あたりに 1 つのヘルスチェックリクエストを受け取ることになります。10 秒の間隔を選択した場合、エンドポイントは 1 秒にあたりに複数のヘルスチェックリクエストを受け取ることになります。`