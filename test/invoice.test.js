'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

const cases = [
  {
    name: 'CURRENT BEHAVIOUR: order #1001 mixed 5% and 12% items without a coupon',
    order: {
      id: 1001,
      coupon: '',
      items: [
        { name: 'Rice', sku: 'GRN-001', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
        { name: 'Ghee', sku: 'DRY-001', price: 450, qty: 1, hsn: '0405', gstRate: 12 }
      ]
    },
    invoiceExpected: {
      subtotal: 1090,
      discount: 0,
      tax: 86,
      cgst: 43,
      sgst: 43,
      total: 1176,
      rows: [
        { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 32 },
        { name: 'Ghee', sku: 'DRY-001', hsn: '0405', qty: 1, price: 450, gstPercent: 12, line: 450, lineTax: 54 }
      ]
    },
    pricingExpected: { subtotal: 1090, discount: 0, tax: 86, cgst: 43, sgst: 43, total: 1176 }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1002 SAVE10 discount precedes 5% GST',
    order: {
      id: 1002,
      coupon: 'SAVE10',
      items: [{ name: 'Rice', sku: 'GRN-001', price: 640, qty: 1, hsn: '1006', gstRate: 5 }]
    },
    invoiceExpected: {
      subtotal: 640,
      discount: 64,
      tax: 28.8,
      cgst: 14.4,
      sgst: 14.4,
      total: 604.8,
      rows: [{ name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 }]
    },
    pricingExpected: { subtotal: 640, discount: 64, tax: 28.8, cgst: 14.4, sgst: 14.4, total: 604.8 }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1004 SAVE10 discount uses the ₹150 cap before 5% GST',
    order: {
      id: 1004,
      coupon: 'SAVE10',
      items: [{ name: 'Groundnut Oil', sku: 'OIL-002', price: 1120, qty: 2, hsn: '1508', gstRate: 5 }]
    },
    invoiceExpected: {
      subtotal: 2240,
      discount: 150,
      tax: 104.5,
      cgst: 52.25,
      sgst: 52.25,
      total: 2194.5,
      rows: [{ name: 'Groundnut Oil', sku: 'OIL-002', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }]
    },
    pricingExpected: { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1008 all 18% items without a coupon',
    order: {
      id: 1008,
      coupon: '',
      items: [
        { name: 'Tea', sku: 'TEA-001', price: 100, qty: 2, hsn: '0902', gstRate: 18 }
      ]
    },
    invoiceExpected: {
      subtotal: 200,
      discount: 0,
      tax: 36,
      cgst: 18,
      sgst: 18,
      total: 236,
      rows: [{ name: 'Tea', sku: 'TEA-001', hsn: '0902', qty: 2, price: 100, gstPercent: 18, line: 200, lineTax: 36 }]
    },
    pricingExpected: { subtotal: 200, discount: 0, tax: 36, cgst: 18, sgst: 18, total: 236 }
  }
];

for (const scenario of cases) {
  test(scenario.name, () => {
    const figures = invoice.computeInvoiceFigures(scenario.order);
    const checkout = pricing.computeTotals(scenario.order.items, scenario.order.coupon);

    assert.deepEqual(figures, scenario.invoiceExpected);
    assert.deepEqual(
      {
        subtotal: checkout.subtotal,
        discount: checkout.discount,
        tax: checkout.tax,
        cgst: checkout.cgst,
        sgst: checkout.sgst,
        total: checkout.total
      },
      scenario.pricingExpected
    );
  });
}

test('Invoice matches checkout GST slabs and capped pre-tax coupon discount', () => {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { name: 'Groundnut Oil', sku: 'OIL-002', price: 1120, qty: 2, hsn: '1508', gstRate: 5 }
    ]
  };
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutFigures = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual(
    {
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      cgst: invoiceFigures.cgst,
      sgst: invoiceFigures.sgst,
      total: invoiceFigures.total,
      gstPercent: invoiceFigures.rows[0].gstPercent,
      lineTax: invoiceFigures.rows[0].lineTax
    },
    {
      subtotal: checkoutFigures.subtotal,
      discount: checkoutFigures.discount,
      tax: checkoutFigures.tax,
      cgst: checkoutFigures.cgst,
      sgst: checkoutFigures.sgst,
      total: checkoutFigures.total,
      gstPercent: checkoutFigures.lines[0].gstPercent,
      lineTax: checkoutFigures.lines[0].tax
    }
  );
});
