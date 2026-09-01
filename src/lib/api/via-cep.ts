export type ViaCepAddress = {
  bairro: string;
  cep: string;
  complemento: string;
  gia?: string;
  ibge?: string;
  localidade: string;
  logradouro: string;
  siafi?: string;
  uf: string;
};

type ViaCepErrorResponse = {
  erro?: boolean;
};

export class ViaCepError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ViaCepError";
    this.status = status;
  }
}

function normalizeCep(cep: string) {
  return cep.replace(/\D/g, "");
}

async function parseViaCepResponse(response: Response) {
  try {
    return (await response.json()) as ViaCepAddress & ViaCepErrorResponse;
  } catch {
    return {} as ViaCepAddress & ViaCepErrorResponse;
  }
}

export async function getAddressByCep(cep: string, options: Pick<RequestInit, "signal"> = {}) {
  const normalizedCep = normalizeCep(cep);

  if (normalizedCep.length !== 8) {
    throw new ViaCepError("Informe um CEP com 8 digitos.");
  }

  const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`, {
    signal: options.signal,
  });
  const data = await parseViaCepResponse(response);

  if (!response.ok) {
    throw new ViaCepError("Nao foi possivel consultar o CEP.", response.status);
  }

  if (data.erro) {
    throw new ViaCepError("CEP nao encontrado.");
  }

  return data as ViaCepAddress;
}
