import { AmountInput } from '@alfalab/core-components/amount-input/cssm';
import { Button } from '@alfalab/core-components/button/cssm';
import { Divider } from '@alfalab/core-components/divider/cssm';
import { Gap } from '@alfalab/core-components/gap/cssm';
import { Spinner } from '@alfalab/core-components/spinner/cssm';
import { Tag } from '@alfalab/core-components/tag/cssm';
import { Typography } from '@alfalab/core-components/typography/cssm';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import rubIcon from './assets/rub.png';
import { useTimeout } from './hooks/useTimeout';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
import { ThxLayout } from './thx/ThxLayout';
import {
  calcIncomeByMonths,
  calculateInvestmentIncome,
  calculateStateSupport,
  calculateTaxRefund,
  randomDocNumber,
  randomEmailRu,
  randomOtpCode,
} from './utils/calc';
import { sendDataToGA } from './utils/events';
import { round } from './utils/round';

const investPeriods = [
  {
    title: '1 месяц',
    value: 1,
    vkladPercent: 0.3603,
  },
  {
    title: '2 месяца',
    value: 2,
    vkladPercent: 0.2701,
  },
  {
    title: '3 месяца',
    value: 3,
    vkladPercent: 0.21,
  },
  {
    title: '6 месяцев',
    value: 6,
    vkladPercent: 0.1802,
  },
  {
    title: '12 месяцев',
    value: 12,
    vkladPercent: 0.15,
  },
];

const MIN_INVEST_SUM = 60_000;

const docNumberVklad = randomDocNumber();
const emailRu = randomEmailRu();

export const App = () => {
  const [thxShow, setThx] = useState(LS.getItem(LSKeys.ShowThx, false));
  const [steps, setSteps] = useState<'init' | 'step1' | 'step2' | 'step-confirm3' | 'step-confirmed3' | 'step3' | 'step4'>(
    'init',
  );
  const [sum, setSum] = useState(MIN_INVEST_SUM);
  const [error, setError] = useState('');
  const [invetstPeriod, setInvestPeriod] = useState<number>(1);
  const [otpCode, setOtpCode] = useState('');

  const shouldErrorInvestSum = !sum || sum < MIN_INVEST_SUM;
  const investPeriodData = investPeriods.find(period => period.value === invetstPeriod) ?? investPeriods[0];
  const vkladSum = round(sum / 2);
  const pdsSum = round(sum / 2);
  const taxRefund = calculateTaxRefund(pdsSum);
  const govCharity = calculateStateSupport(pdsSum);
  const investmentsIncome = calculateInvestmentIncome(pdsSum, 0);
  const total = investmentsIncome + govCharity + taxRefund;

  const withOtpCode = steps === 'step3';

  useTimeout(
    () => {
      setOtpCode(randomOtpCode());
    },
    withOtpCode ? 2500 : null,
  );
  useTimeout(
    () => {
      window.gtag('event', '7364_sms_pds_deposit', { var: 'var7' });

      submit();
    },
    withOtpCode ? 3500 : null,
  );

  useEffect(() => {
    if (!LS.getItem(LSKeys.UserId, null)) {
      LS.setItem(LSKeys.UserId, Date.now());
    }
  }, []);

  const submit = () => {
    sendDataToGA({
      sum: vkladSum,
      product_type: 'Вклад',
    });
    setThx(true);
    LS.setItem(LSKeys.ShowThx, true);
  };

  const goToStep2 = () => {
    window.gtag('event', '7364_click_open_pds_deposit_var7');
    if (shouldErrorInvestSum) {
      setError('Минимальная сумма — 60 000 ₽');
      return;
    }

    setSteps('step2');
  };

  const handleChangeInput = (_: React.ChangeEvent<HTMLInputElement> | null, { value }: { value: number | null }) => {
    if (error) {
      setError('');
    }
    setSum(value ?? 0);
  };
  if (thxShow) {
    return <ThxLayout />;
  }

  if (withOtpCode) {
    return (
      <div className={appSt.container}>
        <Typography.TitleResponsive
          tag="h1"
          view="xsmall"
          font="system"
          weight="semibold"
          style={{ textAlign: 'center', marginTop: '1rem' }}
        >
          Введите код из сообщения
        </Typography.TitleResponsive>

        <div className={appSt.codeInput}>
          <div className={appSt.codeInputItem}>{otpCode[0]}</div>
          <div className={appSt.codeInputItem}>{otpCode[1]}</div>
          <div className={appSt.codeInputItem}>{otpCode[2]}</div>
          <div className={appSt.codeInputItem}>{otpCode[3]}</div>
        </div>
        <Typography.Text view="secondary-large" color="secondary" style={{ textAlign: 'center' }}>
          Код отправлен на +7 ••• ••• •• •8
        </Typography.Text>
        <Spinner style={{ margin: 'auto' }} visible preset={24} />
      </div>
    );
  }

  if (steps === 'step2') {
    return (
      <>
        <div className={appSt.container}>
          <Typography.TitleResponsive tag="h1" view="large" font="system" weight="semibold" style={{ marginTop: '1rem' }}>
            Всё проверьте, и можно оплатить
          </Typography.TitleResponsive>

          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Номер договора
            </Typography.Text>
            <Typography.Text view="primary-medium">№{docNumberVklad}</Typography.Text>
          </div>
          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Общая сумма взноса
            </Typography.Text>
            <Typography.Text view="primary-medium">{sum.toLocaleString('ru-RU')} ₽</Typography.Text>
          </div>
          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Сумма ПДС
            </Typography.Text>
            <Typography.Text view="primary-medium">{pdsSum.toLocaleString('ru-RU')} ₽</Typography.Text>
          </div>
          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Сумма на вклад
            </Typography.Text>
            <Typography.Text view="primary-medium">{vkladSum.toLocaleString('ru-RU')} ₽</Typography.Text>
          </div>

          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Срок вклада
            </Typography.Text>
            <Typography.Text view="primary-medium">{investPeriodData.title}</Typography.Text>
          </div>
          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Процент по вкладу
            </Typography.Text>
            <Typography.Text view="primary-medium">
              {(investPeriodData.vkladPercent * 100).toLocaleString('ru-RU')}%
            </Typography.Text>
          </div>

          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Email
            </Typography.Text>
            <Typography.Text view="primary-medium">{emailRu}</Typography.Text>
          </div>
        </div>

        <Gap size={128} />

        <div className={appSt.bottomBtn()}>
          <Button
            block
            view="primary"
            onClick={() => {
              window.gtag('event', '7364_click_pay_pds_deposit_var7');
              setSteps('step3');
            }}
          >
            Оплатить
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={appSt.container}>
        <Typography.TitleResponsive style={{ marginTop: '1rem' }} tag="h1" view="large" font="system" weight="semibold">
          Открытие ПДС и вклада
        </Typography.TitleResponsive>

        <div style={{ marginTop: '12px' }}>
          <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
            Счёт списания
          </Typography.Text>

          <div className={appSt.bannerAccount}>
            <img src={rubIcon} width={48} height={48} alt="rubIcon" />

            <Typography.Text view="primary-small" weight="medium">
              Текущий счёт
            </Typography.Text>
          </div>
        </div>

        <div>
          <AmountInput
            label="Cумма инвестиций"
            labelView="outer"
            value={sum}
            error={error}
            onChange={handleChangeInput}
            block
            minority={1}
            bold={false}
            min={MIN_INVEST_SUM}
          />
          {!shouldErrorInvestSum && (
            <>
              <div className={appSt.rowSb} style={{ marginTop: '.5rem' }}>
                <Typography.Text view="primary-small" color="secondary">
                  На вклад
                </Typography.Text>
                <Typography.Text view="primary-small" color="secondary">
                  {round(sum / 2).toLocaleString('ru-RU')} ₽
                </Typography.Text>
              </div>
              <div className={appSt.rowSb}>
                <Typography.Text view="primary-small" color="secondary">
                  На ПДС
                </Typography.Text>
                <Typography.Text view="primary-small" color="secondary">
                  {round(sum / 2).toLocaleString('ru-RU')} ₽
                </Typography.Text>
              </div>
            </>
          )}
        </div>

        <div>
          <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
            На какой срок открыть вклад
          </Typography.Text>
        </div>
      </div>

      <div>
        <Swiper style={{ margin: '-8px 0 1rem 1rem' }} spaceBetween={12} slidesPerView="auto">
          {investPeriods.map(({ title, value }) => (
            <SwiperSlide key={value} className={appSt.swSlide}>
              <Tag
                view="filled"
                size="xxs"
                shape="rectangular"
                checked={invetstPeriod === value}
                onClick={() => setInvestPeriod(value)}
              >
                {title}
              </Tag>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className={appSt.box2}>
        <Typography.TitleResponsive tag="h2" view="xsmall" font="system" weight="semibold">
          Ваша выгода по двум продуктам
        </Typography.TitleResponsive>

        <div className={appSt.box3}>
          <Typography.Text view="primary-small" weight="medium">
            Вклад
          </Typography.Text>

          <div className={appSt.rowSb}>
            <Typography.Text view="primary-small" color="secondary">
              Ставка
            </Typography.Text>
            <Typography.Text view="primary-small">
              {(investPeriodData.vkladPercent * 100).toLocaleString('ru-RU')}% годовых
            </Typography.Text>
          </div>
          <div className={appSt.rowSb}>
            <Typography.Text view="primary-small" color="secondary">
              Срок
            </Typography.Text>
            <Typography.Text view="primary-small">{investPeriodData.title}</Typography.Text>
          </div>
          <Divider />

          <div className={appSt.rowSb}>
            <Typography.Text view="primary-small" color="secondary">
              Доход за срок
            </Typography.Text>
            <Typography.Text view="primary-medium" weight="medium">
              {calcIncomeByMonths(vkladSum, investPeriodData.vkladPercent, invetstPeriod).toLocaleString('ru-RU')} ₽
            </Typography.Text>
          </div>
        </div>
        <div className={appSt.box3}>
          <Typography.Text view="primary-small" weight="medium">
            ПДС
          </Typography.Text>

          <div className={appSt.rowSb}>
            <Typography.Text view="primary-small" color="secondary">
              Срок
            </Typography.Text>
            <Typography.Text view="primary-small">15 лет</Typography.Text>
          </div>
          <div className={appSt.rowSb}>
            <Typography.Text view="primary-small" color="secondary">
              Доход от инвестиций
            </Typography.Text>
            <Typography.Text view="primary-small">{investmentsIncome.toLocaleString('ru-RU')} ₽</Typography.Text>
          </div>
          <div className={appSt.rowSb}>
            <Typography.Text view="primary-small" color="secondary">
              Государство добавит
            </Typography.Text>
            <Typography.Text view="primary-small">{govCharity.toLocaleString('ru-RU')} ₽</Typography.Text>
          </div>
          <div className={appSt.rowSb}>
            <Typography.Text view="primary-small" color="secondary">
              Налоговые вычеты добавят
            </Typography.Text>
            <Typography.Text view="primary-small">{taxRefund.toLocaleString('ru-RU')} ₽</Typography.Text>
          </div>
          <Divider />

          <div className={appSt.rowSb}>
            <Typography.Text view="primary-small" color="secondary">
              Доход за срок
            </Typography.Text>
            <Typography.Text view="primary-medium" weight="medium">
              {total.toLocaleString('ru-RU')} ₽
            </Typography.Text>
          </div>
        </div>
      </div>

      <Gap size={128} />

      <div className={appSt.bottomBtn()}>
        <Button block view="primary" onClick={goToStep2}>
          Открыть продукты
        </Button>
      </div>
    </>
  );
};
