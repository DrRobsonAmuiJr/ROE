import React, { useState, useEffect, useMemo } from 'react';

// Interface ajustada para não obrigar a prop businessData
interface StrategicPlanningViewProps {
  businessData?: any;
}

interface PlanningTask {
  id: string;
  meta: string; // Anteriormente title
  sector: 'RH e Processos' | 'Financeiro' | 'Inovações e Tecnologia' | 'Comercial' | 'Marketing'; // Anteriormente priority
  status: 'Não Iniciado' | 'Em Andamento' | 'Concluído';
  assignee: string;
  observations?: string; // Nova coluna
  createdAt: string;
}

const SECTOR_OPTIONS = ['RH e Processos', 'Financeiro', 'Inovações e Tecnologia', 'Comercial', 'Marketing'];
const STATUS_OPTIONS = ['Não Iniciado', 'Em Andamento', 'Concluído'];

// Peso para ordenação do status
const STATUS_WEIGHT = {
  'Não Iniciado': 1,
  'Em Andamento': 2,
  'Concluído': 3
};

const StrategicPlanningView: React.FC<StrategicPlanningViewProps> = () => {
  const [tasks, setTasks] = useState<PlanningTask[]>([]);
  const [pageTitle, setPageTitle] = useState('Planejamento 2026');
  const [isAdding, setIsAdding] = useState(false);
  
  // Estado para o filtro de setor
  const [filterSector, setFilterSector] = useState<string>('Todos');

  const [newTask, setNewTask] = useState<Partial<PlanningTask>>({
    meta: '',
    sector: 'RH e Processos',
    status: 'Não Iniciado',
    assignee: '',
    observations: ''
  });

  // Estado para controle da ordenação
  const [sortConfig, setSortConfig] = useState<{ key: keyof PlanningTask; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    // Carregar tarefas
    const savedTasks = localStorage.getItem('roe_strategic_tasks_v2'); 
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Erro ao carregar tarefas", e);
      }
    } else {
        // Tenta migrar dados antigos ou inicia com exemplo
        const oldTasks = localStorage.getItem('roe_strategic_tasks');
        if (oldTasks) {
            try {
                const parsedOld = JSON.parse(oldTasks);
                const migrated = parsedOld.map((t: any) => ({
                    id: t.id,
                    meta: t.title || t.meta || 'Nova Meta',
                    sector: SECTOR_OPTIONS.includes(t.priority) ? t.priority : 'RH e Processos',
                    status: t.status,
                    assignee: t.assignee,
                    observations: '',
                    createdAt: t.createdAt
                }));
                setTasks(migrated);
            } catch (e) {
                 setTasks(getDefaultTasks());
            }
        } else {
            setTasks(getDefaultTasks());
        }
    }

    // Carregar título da página
    const savedTitle = localStorage.getItem('roe_planning_title');
    if (savedTitle) {
        setPageTitle(savedTitle);
    }
  }, []);

  const getDefaultTasks = (): PlanningTask[] => [
    {
        id: '1',
        meta: 'Implementar novo sistema de bonificação',
        sector: 'RH e Processos',
        status: 'Não Iniciado',
        assignee: 'Daiane',
        observations: 'Validar métricas com diretoria',
        createdAt: new Date().toISOString()
    },
     {
        id: '2',
        meta: 'Aumentar faturamento em 15%',
        sector: 'Financeiro',
        status: 'Em Andamento',
        assignee: 'Diretoria',
        observations: '',
        createdAt: new Date().toISOString()
    },
     {
        id: '3',
        meta: 'Lançar campanha de Marketing Digital',
        sector: 'Marketing',
        status: 'Não Iniciado',
        assignee: 'Mkt Team',
        observations: 'Focar no Instagram e Google Ads',
        createdAt: new Date().toISOString()
    }
  ];

  const saveTasks = (newTasks: PlanningTask[]) => {
    setTasks(newTasks);
    localStorage.setItem('roe_strategic_tasks_v2', JSON.stringify(newTasks));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setPageTitle(newTitle);
      localStorage.setItem('roe_planning_title', newTitle);
  };

  const handleAddTask = () => {
    if (!newTask.meta) return;
    const task: PlanningTask = {
      id: Date.now().toString(),
      meta: newTask.meta || 'Nova Meta',
      sector: (newTask.sector as any) || 'RH e Processos',
      status: (newTask.status as any) || 'Não Iniciado',
      assignee: newTask.assignee || 'Daiane',
      observations: newTask.observations || '',
      createdAt: new Date().toISOString()
    };
    saveTasks([...tasks, task]);
    setNewTask({ meta: '', sector: 'RH e Processos', status: 'Não Iniciado', assignee: '', observations: '' });
    setIsAdding(false);
  };

  const updateTask = (id: string, field: keyof PlanningTask, value: any) => {
    const updated = tasks.map(t => t.id === id ? { ...t, [field]: value } : t);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
      if(confirm('Deseja excluir esta meta?')) {
          const updated = tasks.filter(t => t.id !== id);
          saveTasks(updated);
      }
  }

  // Função de ordenação
  const handleSort = (key: keyof PlanningTask) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = useMemo(() => {
    let filteredItems = [...tasks];

    // Aplicar Filtro de Setor
    if (filterSector !== 'Todos') {
        filteredItems = filteredItems.filter(task => task.sector === filterSector);
    }

    // Aplicar Ordenação
    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Lógica específica para Status (Progresso)
        if (sortConfig.key === 'status') {
           // @ts-ignore
           aValue = STATUS_WEIGHT[a.status] || 0;
           // @ts-ignore
           bValue = STATUS_WEIGHT[b.status] || 0;
        } 
        // Lógica padrão para strings (Meta, Setor, Responsável, Obs)
        else {
             aValue = (aValue || '').toString().toLowerCase();
             bValue = (bValue || '').toString().toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredItems;
  }, [tasks, sortConfig, filterSector]);

  // Renderiza ícone de ordenação
  const renderSortIcon = (key: keyof PlanningTask) => {
      if (sortConfig?.key !== key) return <span className="text-gray-300 ml-1 opacity-0 group-hover:opacity-50">↕</span>;
      return <span className="text-blue-600 ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const getSectorColor = (s: string) => {
      switch(s) {
          case 'RH e Processos': return 'bg-purple-100 text-purple-800';
          case 'Financeiro': return 'bg-emerald-100 text-emerald-800';
          case 'Inovações e Tecnologia': return 'bg-blue-100 text-blue-800';
          case 'Comercial': return 'bg-orange-100 text-orange-800';
          case 'Marketing': return 'bg-pink-100 text-pink-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const getStatusColor = (s: string) => {
      switch(s) {
          case 'Não Iniciado': return 'bg-red-100 text-red-800';
          case 'Em Andamento': return 'bg-blue-100 text-blue-800';
          case 'Concluído': return 'bg-green-100 text-green-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };
  
  const formatDate = (dateStr: string) => {
      if(!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md min-h-[600px] flex flex-col font-sans">
        {/* Header estilo Notion */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-gray-700 font-medium text-lg w-full max-w-md">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <input 
                    type="text" 
                    value={pageTitle}
                    onChange={handleTitleChange}
                    className="bg-transparent border-none focus:ring-0 text-lg font-medium text-gray-700 w-full p-0 focus:border-b focus:border-blue-500 rounded-none transition-colors"
                />
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto">
                 {/* Filtro por Setor */}
                 <div className="relative">
                    <select
                        value={filterSector}
                        onChange={(e) => setFilterSector(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                    >
                        <option value="Todos">Todos os Setores</option>
                        {SECTOR_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                 </div>

                 <button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center shadow-sm transition-colors whitespace-nowrap">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Nova Meta
                 </button>
            </div>
        </div>
        
        {/* Formulário de Adição */}
        {isAdding && (
            <div className="p-4 bg-gray-50 border-b border-gray-200 animate-fade-in-down">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-grow min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Meta</label>
                        <input 
                            type="text" 
                            placeholder="Descreva a meta..." 
                            className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={newTask.meta}
                            onChange={e => setNewTask({...newTask, meta: e.target.value})}
                            autoFocus
                        />
                    </div>
                     <div className="min-w-[180px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Setor</label>
                        <select 
                            className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={newTask.sector}
                            onChange={e => setNewTask({...newTask, sector: e.target.value as any})}
                        >
                            {SECTOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                     </div>
                     <div className="min-w-[140px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Progresso</label>
                        <select 
                            className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={newTask.status}
                            onChange={e => setNewTask({...newTask, status: e.target.value as any})}
                        >
                            {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                     </div>
                     <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Responsável</label>
                        <input 
                            type="text" 
                            placeholder="Nome" 
                            className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={newTask.assignee}
                            onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                        />
                     </div>
                     <div className="w-48">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
                        <input 
                            type="text" 
                            placeholder="Obs..." 
                            className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={newTask.observations}
                            onChange={e => setNewTask({...newTask, observations: e.target.value})}
                        />
                     </div>
                    <div className="flex space-x-2 pb-0.5">
                        <button onClick={handleAddTask} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors">Salvar</button>
                        <button onClick={() => setIsAdding(false)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded text-sm font-medium transition-colors">Cancelar</button>
                    </div>
                </div>
            </div>
        )}

        {/* Tabela */}
        <div className="overflow-x-auto flex-grow">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                    <tr>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4 min-w-[250px] cursor-pointer hover:bg-gray-100 group select-none transition-colors"
                            onClick={() => handleSort('meta')}
                        >
                            <div className="flex items-center">
                                <span className="mr-1">☰</span> Meta 
                                {renderSortIcon('meta')}
                            </div>
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-40 cursor-pointer hover:bg-gray-100 group select-none transition-colors"
                            onClick={() => handleSort('sector')}
                        >
                            <div className="flex items-center">
                                Setor
                                {renderSortIcon('sector')}
                            </div>
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-36 cursor-pointer hover:bg-gray-100 group select-none transition-colors"
                            onClick={() => handleSort('status')}
                        >
                            <div className="flex items-center">
                                Progresso
                                {renderSortIcon('status')}
                            </div>
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100 group select-none transition-colors"
                            onClick={() => handleSort('assignee')}
                        >
                            <div className="flex items-center">
                                Responsável
                                {renderSortIcon('assignee')}
                            </div>
                        </th>
                         <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-48 cursor-pointer hover:bg-gray-100 group select-none transition-colors"
                            onClick={() => handleSort('observations')}
                        >
                            <div className="flex items-center">
                                Observações
                                {renderSortIcon('observations')}
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Criado em</th>
                        <th scope="col" className="relative px-6 py-3 w-16"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50 group transition-colors">
                            <td className="px-6 py-3">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <input 
                                        type="text" 
                                        value={task.meta} 
                                        onChange={(e) => updateTask(task.id, 'meta', e.target.value)}
                                        className="text-sm font-medium text-gray-900 border-none bg-transparent focus:ring-0 w-full p-0 focus:border-b focus:border-blue-500 rounded-none transition-colors truncate"
                                    />
                                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-gray-200 bg-white text-gray-400 cursor-pointer hover:bg-gray-100 flex-shrink-0">ABRIR</span>
                                </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                                <select 
                                    value={task.sector} 
                                    onChange={(e) => updateTask(task.id, 'sector', e.target.value)}
                                    className={`text-xs px-2 py-1 rounded-sm border-none focus:ring-0 cursor-pointer w-full font-medium ${getSectorColor(task.sector)} appearance-none`}
                                    style={{textAlignLast: 'center'}}
                                >
                                    {SECTOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                                <select 
                                    value={task.status} 
                                    onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                                    className={`text-xs px-2 py-1 rounded-sm border-none focus:ring-0 cursor-pointer w-full font-medium ${getStatusColor(task.status)} appearance-none`}
                                    style={{textAlignLast: 'center'}}
                                >
                                    {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                <input 
                                    type="text" 
                                    value={task.assignee} 
                                    onChange={(e) => updateTask(task.id, 'assignee', e.target.value)}
                                    className="border-none bg-transparent focus:ring-0 w-full p-0 text-sm text-gray-600"
                                />
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                <input 
                                    type="text" 
                                    value={task.observations || ''} 
                                    onChange={(e) => updateTask(task.id, 'observations', e.target.value)}
                                    className="border-none bg-transparent focus:ring-0 w-full p-0 text-sm text-gray-600 truncate"
                                    placeholder="-"
                                />
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(task.createdAt)}
                            </td>
                             <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {sortedTasks.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                                Nenhuma meta encontrada{filterSector !== 'Todos' ? ` para o setor "${filterSector}"` : ''}. Clique em "Nova Meta" para começar.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default StrategicPlanningView;