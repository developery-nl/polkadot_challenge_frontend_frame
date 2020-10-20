import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // The transaction submission status
  const [status, setStatus] = useState('');

  // The currently stored value
  const [currentFruitname, setCurrentFruitname] = useState("");
  const [currentAmountavailable, setCurrentAmountavailable] = useState(0);
  const [currentOutofsupply, setCurrentOutofsupply] = useState(null);
  const [fruitname, setFruitname] = useState("");
  const [amountavailable, setAmountavailable] = useState(0);

  const supply = () => {
    return currentOutofsupply && currentOutofsupply.isSome ? 'Looks our fruit supply needs ' + currentOutofsupply.toString() + ' more' : 'No fruit shortage.'
  };

  useEffect(() => {
    let unsubscribe;
    console.log(api.query.templateModule);
    api.query.templateModule.details(newValue => {
      // storage value is an Option<u32>

      if (newValue.isNone) {
        setCurrentAmountavailable('0');
        setCurrentFruitname('<None>');
      } else {
        console.log(newValue);
        setCurrentOutofsupply(newValue.OutOfSupply);
        setCurrentAmountavailable(newValue.AmountSubmitted.toString());
        setCurrentFruitname(newValue.Fruitname.toHuman());
      }
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.templateModule]);

  return (
    <Grid.Column width={8}>
      <h1>Fruit supply details</h1>
      <Card>
        <Card.Content>
          <Card.Header content={currentFruitname} />
          <Card.Meta content={currentAmountavailable + ' pieces available.'} />
          <Card.Description content={supply()} />
        </Card.Content>
      </Card>
      <Form>
        <Form.Field>
          <Input
            label='Fruit'
            state='newValue'
            type='string'
            onChange={(_, { value }) => setFruitname(value)}
          />
        </Form.Field>
        <Form.Field>
          <Input
            label='# pieces'
            state='newValue'
            type='number'
            onChange={(_, { value }) => setAmountavailable(value)}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            accountPair={accountPair}
            label='Update Details'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'templateModule',
              callable: 'updateMystructDetails',
              inputParams: [{"Fruitname": fruitname, "AmountSubmitted": amountavailable, "OutOfSupply": null}],
              paramFields: [true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function MyStructDetails (props) {
  const { api } = useSubstrate();
  return (api.query.templateModule && api.query.templateModule.something
    ? <Main {...props} /> : null);
}
