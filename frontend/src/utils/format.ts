export const formatPrice = (price: number | string): string => {
    const num = typeof price === 'number' ? price : Number(price);
    return `${num.toLocaleString('vi-VN')}đ`;
}; 