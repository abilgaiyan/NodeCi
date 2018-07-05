const Page = require('./helper/page');

let page;

beforeEach( async () =>{

    page = await Page.build();
    await page.goto('http://localhost:3000');

} );

afterEach( async () =>{
   await page.close();
})

test('lanuch a browser', async () => {

    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
} );

test('click login to start oauth flow', async () => {
   await page.click('.right a');
   const url = await page.url();
   //console.log(url);
   expect(url).toMatch(/accounts\.google\.com/);

});

test('on login, we see logout button', async () =>{
 
  await page.login();
  const text = await page.getContentsOf('a[href="/auth/logout"]');
  expect(text).toEqual('Logout');

});