import { FormAddon } from '@/components/ui';
import { DebouncedTextInput, DebouncedTextarea } from '@/components/ui/DebouncedInput';
import { Stack, Paper, Group, Box, Text, SegmentedControl, Collapse, Badge } from '@mantine/core';
import { BeaconSettings } from './track/BeaconSettings';
import { LandmarkSettings } from './track/LandmarkSettings';
import { NavigationSettings } from './track/NavigationSettings';
import { ScoreboardSettings } from './track/ScoreboardSettings';

interface TrackAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
    type: 'quest' | 'task';
}

function TriStateAddon({ label, description, value, onChange, children }: {
    label: string;
    description?: string;
    value?: boolean | null;
    onChange: (value: boolean | null | undefined) => void;
    children?: React.ReactNode;
}) {
    const stringValue = value === true ? 'on' : value === false ? 'off' : 'default';

    const renderLabel = () => {
        const match = label.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
            return (
                <Group gap={8}>
                    <Text fw={500}>{match[1]}</Text>
                    <Badge size="sm" variant="light" color="gray" style={{ textTransform: 'none' }}>
                        {match[2]}
                    </Badge>
                </Group>
            );
        }
        return <Text fw={500}>{label}</Text>;
    };

    return (
        <Paper withBorder p="md" style={{
            borderColor: value === true ? 'var(--mantine-color-blue-8)' : 
                        value === false ? 'var(--mantine-color-dark-4)' : undefined,
            backgroundColor: value === true ? 'rgba(25, 113, 194, 0.05)' : 
                           value === false ? 'var(--mantine-color-dark-8)' : undefined
        }}>
            <Group justify="space-between" mb={value === true && children ? 'md' : 0}>
                <Box style={{ opacity: value === false ? 0.5 : 1 }}>
                    {renderLabel()}
                    {description && <Text size="xs" c="dimmed">{description}</Text>}
                </Box>
                <SegmentedControl
                    size="xs"
                    value={stringValue}
                    onChange={(val) => {
                        if (val === 'on') onChange(true);
                        else if (val === 'off') onChange(false);
                        else onChange(undefined);
                    }}
                    data={[
                        { label: '开启', value: 'on' },
                        { label: '默认', value: 'default' },
                        { label: '关闭', value: 'off' },
                    ]}
                />
            </Group>
            {children && (
                <Collapse in={value === true}>
                    <Stack gap="md">
                        {children}
                    </Stack>
                </Collapse>
            )}
        </Paper>
    );
}

export function TrackAddon({ addon, onChange, type }: TrackAddonProps) {
    const updateTrack = (key: string, value: any) => {
        onChange({
            ...addon,
            track: { ...addon?.track, [key]: value }
        });
    };

    return (
        <FormAddon
            label="追踪 (Track)"
            description="任务追踪设置"
            checked={!!addon?.track}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, track: {} });
                } else {
                    const { track, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <Stack gap="md">
                {type === 'task' && (
                    <DebouncedTextInput
                        label="追踪中心 (Center)"
                        description="固定坐标点 (world x y z) 或 NPC 单位 (adyeshach npc_id)"
                        placeholder="world 100 64 100"
                        value={addon?.track?.center || ''}
                        onChange={(val) => updateTrack('center', val)}
                        debounceMs={800}
                    />
                )}
                <DebouncedTextInput
                    label="追踪名称 (Name)"
                    description="追踪显示名称（支持语言文件）"
                    value={addon?.track?.name || ''}
                    onChange={(val) => updateTrack('name', val)}
                    debounceMs={800}
                />
                <DebouncedTextarea
                    label="追踪描述 (Description)"
                    description="追踪描述（支持语言文件）"
                    value={Array.isArray(addon?.track?.description) ? addon.track.description.join('\n') : (addon?.track?.description || '')}
                    onChange={(val) => updateTrack('description', val.split('\n'))}
                    autosize
                    minRows={2}
                    debounceMs={800}
                />
                <DebouncedTextarea
                    label="提示信息 (Message)"
                    description="开启追踪时的提示信息"
                    value={Array.isArray(addon?.track?.message) ? addon.track.message.join('\n') : (addon?.track?.message || '')}
                    onChange={(val) => updateTrack('message', val.split('\n'))}
                />

                <TriStateAddon
                    label="信标 (Beacon)"
                    description="在目标位置显示粒子柱"
                    value={addon?.track?.beacon}
                    onChange={(val) => updateTrack('beacon', val)}
                >
                    <BeaconSettings 
                        data={addon?.track?.['beacon-option'] || {}} 
                        onChange={(data) => updateTrack('beacon-option', data)} 
                    />
                </TriStateAddon>

                <TriStateAddon
                    label="地标 (Landmark)"
                    description="标记目标点位置"
                    value={addon?.track?.landmark}
                    onChange={(val) => updateTrack('landmark', val)}
                >
                    <LandmarkSettings 
                        data={addon?.track?.['landmark-option'] || {}} 
                        onChange={(data) => updateTrack('landmark-option', data)} 
                    />
                </TriStateAddon>

                <TriStateAddon
                    label="导航 (Navigation)"
                    description="提供路径指引"
                    value={addon?.track?.navigation}
                    onChange={(val) => updateTrack('navigation', val)}
                >
                    <NavigationSettings 
                        data={addon?.track?.['navigation-option'] || {}} 
                        onChange={(data) => updateTrack('navigation-option', data)} 
                    />
                </TriStateAddon>

                <TriStateAddon
                    label="记分板 (Scoreboard)"
                    description="显示任务信息"
                    value={addon?.track?.scoreboard}
                    onChange={(val) => updateTrack('scoreboard', val)}
                >
                    <ScoreboardSettings 
                        data={addon?.track?.['scoreboard-option'] || {}} 
                        onChange={(data) => updateTrack('scoreboard-option', data)} 
                    />
                </TriStateAddon>
            </Stack>
        </FormAddon>
    );
}
