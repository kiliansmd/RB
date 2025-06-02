import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { debounce } from 'lodash';

export function ResumeSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [seniority, setSeniority] = useState(searchParams.get('seniority') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [experienceRange, setExperienceRange] = useState<[number, number]>([
    parseInt(searchParams.get('minExperience') || '0'),
    parseInt(searchParams.get('maxExperience') || '20')
  ]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    searchParams.get('skills')?.split(',').filter(Boolean) || []
  );

  // Debounced search
  const performSearch = useCallback(
    debounce((params: URLSearchParams) => {
      router.push(`/resumes?${params.toString()}`);
    }, 300),
    [router]
  );

  const updateSearch = (updates: Record<string, string | string[] | number[]>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === 'experienceRange') {
          params.set('minExperience', value[0].toString());
          params.set('maxExperience', value[1].toString());
        } else if (value.length > 0) {
          params.set(key, value.join(','));
        } else {
          params.delete(key);
        }
      } else if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    
    performSearch(params);
  };

  const clearFilters = () => {
    setQuery('');
    setSeniority('');
    setLocation('');
    setExperienceRange([0, 20]);
    setSelectedSkills([]);
    router.push('/resumes');
  };

  const hasFilters = query || seniority || location || 
    experienceRange[0] > 0 || experienceRange[1] < 20 || 
    selectedSkills.length > 0;

  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'Java', 'SQL', 'Docker', 'AWS', 'Azure', 'GraphQL', 'REST'
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-950 h-4 w-4" />
          <Input
            placeholder="Nach Namen, Position oder Skills suchen..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              updateSearch({ query: e.target.value });
            }}
            className="pl-10"
          />
        </div>
        
        <Select
          value={seniority}
          onValueChange={(value) => {
            setSeniority(value);
            updateSearch({ seniority: value });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seniorität" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="mid">Mid-Level</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Erweiterte Filter
              {hasFilters && (
                <Badge variant="secondary" className="ml-1">
                  {[
                    query ? 1 : 0,
                    seniority ? 1 : 0,
                    location ? 1 : 0,
                    experienceRange[0] > 0 || experienceRange[1] < 20 ? 1 : 0,
                    selectedSkills.length > 0 ? 1 : 0
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <div className="space-y-4">
              <div>
                <Label>Standort</Label>
                <Input
                  placeholder="z.B. Berlin, München..."
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    updateSearch({ location: e.target.value });
                  }}
                />
              </div>

              <div>
                <Label>Erfahrung (Jahre)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-950">{experienceRange[0]}</span>
                  <Slider
                    value={experienceRange}
                    onValueChange={(value) => {
                      setExperienceRange(value as [number, number]);
                      updateSearch({ experienceRange: value });
                    }}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-950">{experienceRange[1]}+</span>
                </div>
              </div>

              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newSkills = selectedSkills.includes(skill)
                          ? selectedSkills.filter(s => s !== skill)
                          : [...selectedSkills, skill];
                        setSelectedSkills(newSkills);
                        updateSearch({ skills: newSkills });
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            title="Filter zurücksetzen"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {query && (
            <Badge variant="secondary" className="gap-1">
              Suche: {query}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setQuery('');
                  updateSearch({ query: '' });
                }}
              />
            </Badge>
          )}
          {seniority && (
            <Badge variant="secondary" className="gap-1">
              {seniority}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSeniority('');
                  updateSearch({ seniority: '' });
                }}
              />
            </Badge>
          )}
          {location && (
            <Badge variant="secondary" className="gap-1">
              {location}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setLocation('');
                  updateSearch({ location: '' });
                }}
              />
            </Badge>
          )}
          {(experienceRange[0] > 0 || experienceRange[1] < 20) && (
            <Badge variant="secondary" className="gap-1">
              {experienceRange[0]}-{experienceRange[1]}+ Jahre
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setExperienceRange([0, 20]);
                  updateSearch({ experienceRange: [0, 20] });
                }}
              />
            </Badge>
          )}
          {selectedSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1">
              {skill}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newSkills = selectedSkills.filter(s => s !== skill);
                  setSelectedSkills(newSkills);
                  updateSearch({ skills: newSkills });
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 