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
  linkedAccountId?: string; // Optional, for cross-account billing
}

export class BillingAlarmStack extends cdk.Stack {

  email: string;
  threshold: number;
  linkedAccountId?: string;
  topic: sns.ITopic;
  alarm: cloudwatch.IAlarm;

  constructor( scope: Construct, id: string, props: BillingAlarmStackProps ) {
    super( scope, id, props );

    const { email, threshold, linkedAccountId } = props;

    this.email = email;
    this.threshold = threshold;
    this.linkedAccountId = linkedAccountId;

    // SNS Topic for billing notifications
    this.topic = this.createNotificationTopic( );
    this.alarm = this.createBillingAlarm( );

  }

  createNotificationTopic() {

    const displayName = this.linkedAccountId
      ? `Billing Alarm Notification Topic - Acct. ${ this.linkedAccountId }`
      : 'Billing Alarm Notification Topic';

    const topicName = this.linkedAccountId
      ? `BillingAlarmNotificationTopic-${ this.linkedAccountId }`
      : 'BillingAlarmNotificationTopic';

    // Configure topic for failure notifications
    const topic = new sns.Topic( this, 'BillingAlarmTopic', {
      displayName,
      topicName,
    } );
    topic.addSubscription( new sns_subscriptions.EmailSubscription( this.email ) );

    // IAM policy to allow CloudWatch to publish to SNS
    topic.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudwatch.amazonaws.com')],
        actions: ['sns:Publish'],
        resources: [topic.topicArn],
      })
    );

    return topic;
  }

  createBillingAlarm() {
    const alarmName = this.linkedAccountId
      ? `TotalBillingAlarm-${this.linkedAccountId}`
      : 'TotalBillingAlarm';

    const alarmDescription = this.linkedAccountId
      ? `Alarm for total billing in account ${ this.linkedAccountId }`
      : 'Alarm for total billing in this account';

    // CloudWatch Alarm for AWS billing
    const billingAlarm = new cloudwatch.Alarm(this, 'BillingAlarm', {
      alarmName,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Billing',
        metricName: 'EstimatedCharges',
        dimensionsMap: {
          Currency: 'USD',
          ...( this.linkedAccountId ? { LinkedAccount: this.linkedAccountId } : {} )
        },
        statistic: 'Maximum',
        period: cdk.Duration.hours(6),
      }),
      threshold: this.threshold,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription,
      actionsEnabled: true,
    });

    billingAlarm.addAlarmAction(new cw_actions.SnsAction( this.topic ));

    return billingAlarm;

  }

}
