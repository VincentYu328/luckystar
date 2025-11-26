import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProductCard from '$lib/components/products/ProductCard.svelte';

describe('ProductCard Component', () => {
  it('renders product name', () => {
    const { getByText } = render(ProductCard, {
      props: {
        product: {
          id: 1,
          name: 'Test Fabric',
          base_price: 20,
          images: []
        }
      }
    });

    expect(getByText('Test Fabric')).toBeTruthy();
  });
});
