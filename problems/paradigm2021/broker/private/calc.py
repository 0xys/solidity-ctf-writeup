DECIMALS = 10**18

token_reserve = 500_000
weth_reserve = 25

token_borrowed = 250_000
weth_deposited = 25

msg_value = 50

def rate():
    return token_reserve/weth_reserve

def safe(weth_deposit):
    return weth_deposit * 2/3 * rate()

def liquidate(token_amount_liquidated):
    return token_amount_liquidated / rate()

def get_amount_out(amount_in, reserve_in, reserve_out):
    amount_in_with_fee = amount_in*997
    numerator = amount_in_with_fee*reserve_out
    denominator = reserve_in*1000 + amount_in_with_fee
    return numerator / denominator

if __name__ == '__main__':
    print(' -- Reserve --')
    print(token_reserve, 'TOKEN')
    print(weth_reserve, 'WETH')
    print('TOKEN/WETH rate:', rate())

    print(' -- Debt status --')
    print('deposited:', weth_deposited, 'WETH')
    print('borrowed:', token_borrowed, 'TOKEN')
    safe_debt = safe(weth_deposited)
    print('Safe Debt:', safe_debt, 'TOKEN')

    for i in range(0,25):
        print(i, 'WETH sold')
        received = get_amount_out(i, weth_reserve, token_reserve)
        print(' -', received, 'TOKEN received')
        _weth_reserve = weth_reserve + i
        _safe_debt = weth_deposited*token_reserve/_weth_reserve*2/3
        print(' - Safe Debt:', _safe_debt, 'TOKEN')
        _excess = token_borrowed - _safe_debt
        print(' - Undercolateralized:', _excess, 'TOKEN')
        token_repaid = received
        print(' - liquidate with:', token_repaid, 'TOKEN')
        _token_reserve = token_reserve - received
        _weth_liquidatable = token_repaid*_weth_reserve/_token_reserve
        print(' - in return of:', _weth_liquidatable, 'WETH')
        print(' - remaining deposit:', weth_deposited - _weth_liquidatable, 'WETH')