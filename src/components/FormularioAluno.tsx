import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import axios from "axios";

interface Responsavel {
  nome: string;
  grauParentesco: string;
}

const FormularioAluno: React.FC = () => {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    transporteEscolar: "",
    turmasEnum: "",
    adultosResponsaveis: [{ nome: "", grauParentesco: "" }] as Responsavel[],
  });

  const [formEnviado, setFormEnviado] = useState(false);
  const [nomeErro, setNomeErro] = useState("");
  const [telefoneErro, setTelefoneErro] = useState("");
  const [transporteErro, setTransporteErro] = useState("");
  const [alunoPodeIrSozinho, setAlunoPodeIrSozinho] = useState(false);

  const isTurmaAutorizadaParaSozinho = (turma: string) => {
    const turmasPermitidas = [
      "TURMA_6A",
      "TURMA_6B",
      "TURMA_6C",
      "TURMA_7A",
      "TURMA_7B",
      "TURMA_7C",
      "TURMA_8A",
      "TURMA_8B",
      "TURMA_8C",
      "TURMA_9A",
      "TURMA_9B",
      "TURMA_9C",
    ];
    return turmasPermitidas.includes(turma);
  };

  const verificarNomeDisponivel = async (nome: string) => {
    if (!nome.trim()) return;
    try {
      const response = await axios.get(
        "https://controledeturmas-production.up.railway.app/alunos/check-nome",
        // "http://localhost:8080/alunos/check-nome",
        {
          params: { nome },
        }
      );
      if (response.data) {
        setNomeErro(
          "O aluno já está cadastrado no Sistema, acione a coordenação."
        );
      } else {
        setNomeErro("");
      }
    } catch (error) {
      setNomeErro("Erro ao verificar o nome. Tente novamente.");
    }
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "turmasEnum") {
      if (isTurmaAutorizadaParaSozinho(value)) {
        // Se a turma for autorizada, exibe o checkbox desmarcado
        setAlunoPodeIrSozinho(false);
      } else {
        // Se a turma não for autorizada, o checkbox desaparece
        setAlunoPodeIrSozinho(false);
      }
    }

    if (name === "telefone") {
      // Formatar telefone como (XX) XXXXX-XXXX
      let formattedValue = value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
      if (formattedValue.length > 2) {
        formattedValue = `(${formattedValue.slice(
          0,
          2
        )}) ${formattedValue.slice(2, 7)}-${formattedValue.slice(7, 11)}`;
      }
      setForm((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResponsavelChange = (
    index: number,
    field: keyof Responsavel,
    value: string
  ) => {
    setForm((prev) => {
      const updatedResponsaveis = [...prev.adultosResponsaveis];
      updatedResponsaveis[index][field] = value;
      return { ...prev, adultosResponsaveis: updatedResponsaveis };
    });
  };

  const addResponsavel = () => {
    setForm((prev) => ({
      ...prev,
      adultosResponsaveis: [
        ...prev.adultosResponsaveis,
        { nome: "", grauParentesco: "" },
      ],
    }));
  };

  const removeResponsavel = (index: number) => {
    setForm((prev) => {
      const updatedResponsaveis = prev.adultosResponsaveis.filter(
        (_, i) => i !== index
      );
      return { ...prev, adultosResponsaveis: updatedResponsaveis };
    });
  };

  const validateForm = () => {
    let isValid = true;

    if (form.nome.trim().length < 3) {
      setNomeErro("O nome deve ter pelo menos 3 caracteres.");
      isValid = false;
    } else {
      setNomeErro("");
    }

    if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(form.telefone)) {
      setTelefoneErro(
        "O telefone deve digitar somente números e conter DDD e Número Fixo ou Celular (Ex: 34 98765-4321)"
      );
      isValid = false;
    } else {
      setTelefoneErro("");
    }

    if (!form.transporteEscolar.trim()) {
      setTransporteErro(
        "O campo Transporte Escolar é obrigatório, caso não tenha, preencher (Não Possuo)"
      );
      isValid = false;
    } else {
      setTransporteErro("");
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Há campos obrigatórios ainda não preenchidos.");
      return;
    }

    // Sanitizar o telefone para enviar apenas números
    const telefoneSanitizado = form.telefone.replace(/\D/g, "");

    const payload = {
      nome: form.nome,
      telefone: telefoneSanitizado,
      transporteEscolar: form.transporteEscolar,
      turmasEnum: form.turmasEnum,
      adultosResponsaveis: form.adultosResponsaveis.map((responsavel) => ({
        nome: responsavel.nome,
        grauParentesco: responsavel.grauParentesco,
      })),
      alunoPodeIrSozinho: alunoPodeIrSozinho,
    };

    console.log("JSON enviado:", JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(
        "https://controledeturmas-production.up.railway.app/alunos",
        // "http://localhost:8080/alunos",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Resposta do servidor:", response.data);
      alert("Aluno cadastrado com sucesso!");
      setFormEnviado(true);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      alert("Erro ao cadastrar aluno. Confira os campos e tente novamente.");
    }
  };

  if (formEnviado) {
    return (
      <Container className="mt-5 text-center">
        <h1 style={{ color: "#007BFF", fontWeight: "bold" }}>
          Formulário Enviado Com Sucesso, Obrigado!
        </h1>
        <img
          src="/ImagemFinal.webp"
          alt="Sucesso"
          style={{ maxWidth: "400px", marginTop: "20px" }}
        />
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col className="d-flex align-items-center">
          <img
            src="/LogoSchool.png"
            alt="Logo"
            style={{ height: "65px", marginRight: "20px" }}
          />
          <h1
            style={{
              color: "#007BFF",
              fontWeight: "bold",
              marginLeft: "2.5rem",
            }}
          >
            Cadastro de Aluno
          </h1>
        </Col>
      </Row>
      <Card className="p-4 shadow" style={{ width: "40rem" }}>
        <Form onSubmit={handleSubmit}>
          {/* Nome */}
          <Form.Group className="mb-4" controlId="formNome">
            <Form.Label>
              <strong>Nome da Criança *</strong>
            </Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              onBlur={(e) => verificarNomeDisponivel(e.target.value)}
              placeholder="Digite o nome completo"
              required
              style={nomeErro ? { borderColor: "red" } : {}}
            />
            {nomeErro && (
              <div style={{ color: "red", marginTop: "5px" }}>{nomeErro}</div>
            )}
          </Form.Group>

          {/* Telefone */}
          <Form.Group className="mb-4" controlId="formTelefone">
            <Form.Label>
              <strong>Telefone do Responsável *</strong>
            </Form.Label>
            <Form.Control
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(XX) XXXXX-XXXX"
              maxLength={15}
              required
              style={telefoneErro ? { borderColor: "red" } : {}}
            />
            {telefoneErro && (
              <div style={{ color: "red", marginTop: "5px" }}>
                {telefoneErro}
              </div>
            )}
          </Form.Group>

          {/* Transporte Escolar */}
          <Form.Group className="mb-4" controlId="formTransporte">
            <Form.Label>
              <strong>
                Transporte Escolar (Caso não tenha, preencher "Não Tem") *
              </strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              name="transporteEscolar"
              value={form.transporteEscolar}
              onChange={handleChange}
              placeholder="Caso a Criança esteja autorizada a ser retirada da escola pelo Transporte Escolar, escreva o Nome do Transportador"
              rows={3}
              required
              style={transporteErro ? { borderColor: "red" } : {}}
            />
            {transporteErro && (
              <div style={{ color: "red", marginTop: "5px" }}>
                {transporteErro}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-4" controlId="formTurma">
            <Form.Label>
              <strong>Turma da Criança</strong>
            </Form.Label>
            <Form.Select
              name="turmasEnum"
              value={form.turmasEnum}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              <option value="TURMA_1A">Turma 1A</option>
              <option value="TURMA_1B">Turma 1B</option>
              <option value="TURMA_1C">Turma 1C</option>
              <option value="TURMA_2A">Turma 2A</option>
              <option value="TURMA_2B">Turma 2B</option>
              <option value="TURMA_2C">Turma 2C</option>
              <option value="TURMA_2D">Turma 2D</option>
              <option value="TURMA_3A">Turma 3A</option>
              <option value="TURMA_3B">Turma 3B</option>
              <option value="TURMA_3C">Turma 3C</option>
              <option value="TURMA_4A">Turma 4A</option>
              <option value="TURMA_4B">Turma 4B</option>
              <option value="TURMA_4C">Turma 4C</option>
              <option value="TURMA_5A">Turma 5A</option>
              <option value="TURMA_5B">Turma 5B</option>
              <option value="TURMA_5C">Turma 5C</option>
              <option value="TURMA_6A">Turma 6A</option>
              <option value="TURMA_6B">Turma 6B</option>
              <option value="TURMA_6C">Turma 6C</option>
              <option value="TURMA_7A">Turma 7A</option>
              <option value="TURMA_7B">Turma 7B</option>
              <option value="TURMA_7C">Turma 7C</option>
              <option value="TURMA_8A">Turma 8A</option>
              <option value="TURMA_8B">Turma 8B</option>
              <option value="TURMA_8C">Turma 8C</option>
              <option value="TURMA_9A">Turma 9A</option>
              <option value="TURMA_9B">Turma 9B</option>
              <option value="TURMA_9C">Turma 9C</option>
            </Form.Select>
          </Form.Group>

          {isTurmaAutorizadaParaSozinho(form.turmasEnum) && (
            <Form.Group controlId="formIrSozinho" className="mb-4">
              <Form.Check
                type="checkbox"
                label="Aluno pode ir embora sozinho"
                checked={alunoPodeIrSozinho}
                onChange={(e) => setAlunoPodeIrSozinho(e.target.checked)}
              />
            </Form.Group>
          )}

          <h2 style={{ color: "#007BFF", marginTop: "20px" }}>Responsáveis</h2>
          <p>
            <strong>
              {" "}
              A criança está autorizada a ir embora da escola com os seguintes
              adultos: (mesmo que a criança seja retirada por Transporte
              escolar, preencher nomes dos adultos que podem retira-la em caso
              de emergência ou ausência do Transporte Escolar)!
            </strong>
          </p>
          {form.adultosResponsaveis.map((responsavel, index) => (
            <Card className="p-3 mb-3" key={index}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId={`responsavelNome-${index}`}>
                    <Form.Label>
                      <strong>Nome</strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={responsavel.nome}
                      onChange={(e) =>
                        handleResponsavelChange(index, "nome", e.target.value)
                      }
                      placeholder="Nome do responsável"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId={`responsavelParentesco-${index}`}>
                    <Form.Label>
                      <strong>Parentesco</strong>
                    </Form.Label>
                    <Form.Select
                      value={responsavel.grauParentesco}
                      onChange={(e) =>
                        handleResponsavelChange(
                          index,
                          "grauParentesco",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="Pai">Pai</option>
                      <option value="Mae">Mãe</option>
                      <option value="Avo">Avó/Avô</option>
                      <option value="Irmao">Irmão</option>
                      <option value="Irma">Irmã</option>
                      <option value="Tios">Tio/Tia</option>
                      <option value="Primos">Primo/Prima</option>
                      <option value="TransporteEscolar">
                        Transporte Escolar
                      </option>
                      <option value="Outro">Outro</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="danger"
                    onClick={() => removeResponsavel(index)}
                    className="w-100 d-flex justify-content-center align-items-center"
                  >
                    <FaTrash />
                  </Button>
                </Col>
              </Row>
            </Card>
          ))}

          <Button
            variant="success"
            onClick={addResponsavel}
            className="w-100 mb-4"
          >
            Adicionar mais um Responsável
          </Button>

          <Button type="submit" variant="primary" className="w-100">
            Enviar Formulário
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default FormularioAluno;
