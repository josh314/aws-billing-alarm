import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface BillingAlarmStackProps extends cdk.StackProps {
  email: string;
  threshold: number;
}

export class BillingAlarmStack extends cdk.Stack {
  constructor( scope: Construct, id: string, props: BillingAlarmStackProps ) {
    super( scope, id, props );

    const { email, threshold } = props;

    // SNS Topic for billing notifications
    const billingTopic = new sns.Topic(this, 'BillingAlarmTopic');

    // Subscribe an email recipient (replace with your email)
    billingTopic.addSubscription(new sns_subscriptions.EmailSubscription( email ));

    // CloudWatch Alarm for AWS billing
    const billingAlarm = new cloudwatch.Alarm(this, 'BillingAlarm', {
      alarmName: 'TotalBillingAlarm',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Billing',
        metricName: 'EstimatedCharges',
        dimensionsMap: { Currency: 'USD' },
        statistic: 'Maximum',
        period: cdk.Duration.hours(6),  // Update every 6 hours
      }),
      threshold,  // Set your billing threshold in USD
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `Alarm if total estimated charges exceed ${ threshold }`,
      actionsEnabled: true,
    });

    billingAlarm.addAlarmAction(new cw_actions.SnsAction( billingTopic ));

    // // IAM policy to allow CloudWatch to publish to SNS
    billingTopic.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudwatch.amazonaws.com')],
        actions: ['sns:Publish'],
        resources: [billingTopic.topicArn],
      })
    );
  }
}
