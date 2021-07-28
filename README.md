

# Payme merchant api integration with mongodb database based application

## Author
- [Yusufjon Nazarov](https://github.com/yusufjonnazarov)

## Install
```
npm install payme-merchant-integrator
```

## Usage
### Import `PaymeInterrator` class

```
import { PaymeIntegrator } from 'payme-merchant-integrator';
```

### And initialize `paymeIntegrator` object based class
```
const paymeIntegrator = new PaymeIntegrator({
    db_str: process.env.MONGODB_URL,
    collection: 'payme_transactions', // collection name to save transactions
    type: 'cumulative', // enum ['one-time', 'cumulative'] one time fee or cumulative
    password: process.env.PAYME_PASSWORD,
    isAccountExist,
    markAsPaid,
    getPayingCost, // optional for 'cumulative' type
})
```

There two types of `paymeIntegrator`
* to pay for balance increase `cumulative` fee
* to pay for check means `one-time` fee

### And add methods below for `cumulative` fee
Check account if exists or not
argument `account` is an object that created in payme cabinet <br>
For example `phone` added to account object like this:

![plot](http://ark-buloq.invan.uz/api/uploads/payme1.png)


then `isAccountExist` method should be
```
const isAccountExist = async (account) => {
    const is_user_exist = await UserModel.findOne({phone: account.phone});
    if(!is_user_exist) return false;
    return true;
}
```

To increase balance after payment
```
const markAsPaid = async (account, amount) => {
    await UserModel.findOneAndUpdate(
        {phone: account.phone},
        { $inc: { balance: amount } }
    );
}
```


### And add methods below for `one-time` fee
then `isAccountExist` method should be
```
const isAccountExist = async (account) => {
    const is_user_exist = await CheckModel.findOne({check_id: account.check_id});
    if(!is_user_exist) return false;
    return true;
}
```

To get get paying cost
```
const getPayingCost = async (account) => {
    const check = await CheckModel.findOne({check_id: account.check_id});
    return check.cost;
}
```

mark as paid
```
const markAsPaid = async (account, amount) => {
    await CheckModel.findOneAndUpdate(
        {check_id: account.check_id},
        { $set: { paid: true } }
    );
}
```


### Then use from route and middleware
Fastify example

```
const authenticate = async (request, reply) => {
    await paymeIntegrator.authenticate(request, reply);
}

const handler = async (request, reply) => {
    return await paymeIntegrator.handler(request, reply);
}
fastify.post(
    '/payme',
    { preValidation: [authenticate] },
    handler
);
```

And test your endpoint with <a href="https://test.paycom.uz" target="_blank">PaymeTester</a>

Official documentation <a href="https://developer.help.paycom.uz/ru/metody-merchant-api" target="_blank">Payme Merchant</a>
